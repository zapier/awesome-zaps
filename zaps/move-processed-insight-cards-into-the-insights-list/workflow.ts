import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { TRELLO_BOARD_ID, TRELLO_INSIGHTS_LIST_ID } from "./config.ts";

const sdk = createZapierSdk();

// Seconds to pause between card moves, to avoid rate limits.
const SECONDS_BETWEEN_MOVES = 60;

const InsightIdSchema = z
  .union([
    z.string(),
    z.number(),
    z.object({ id: z.union([z.string(), z.number()]) }).loose(),
  ])
  .transform((insight) =>
    String(typeof insight === "object" ? insight.id : insight).trim(),
  );

function readInsightList(rawInput: unknown): unknown[] {
  const body = typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput;
  const payload = Array.isArray(body)
    ? body
    : z.object({ insights: z.unknown().optional() }).loose().parse(body)
        .insights;
  const list = typeof payload === "string" ? JSON.parse(payload) : payload;
  return Array.isArray(list) ? list : [];
}

const workflow = defineDurable(
  "move-processed-insight-cards-into-the-insights-list",
  async (ctx, rawInput) => {
    const insights = readInsightList(rawInput);
    const cardIds: string[] = [];
    let unreadable = 0;
    for (const insight of insights) {
      const parsed = InsightIdSchema.safeParse(insight);
      if (parsed.success && parsed.data) {
        cardIds.push(parsed.data);
      } else {
        unreadable += 1;
      }
    }

    if (cardIds.length === 0) {
      return { skipped: true, reason: "no-insights", unreadable };
    }

    const results: { cardId: string; moved: boolean; error?: string }[] = [];
    for (const [index, cardId] of cardIds.entries()) {
      if (index > 0) {
        await ctx.wait(`wait-before-move-${cardId}`, SECONDS_BETWEEN_MOVES);
      }
      try {
        await ctx.step(`move-card-${cardId}`, async () =>
          sdk.runAction({
            appKey: "trello",
            actionType: "write",
            actionKey: "card_list",
            connection: "trello",
            inputs: {
              card: cardId,
              board: TRELLO_BOARD_ID,
              to_list: TRELLO_INSIGHTS_LIST_ID,
            },
          }),
        );
        results.push({ cardId, moved: true });
      } catch (error) {
        results.push({ cardId, moved: false, error: String(error) });
      }
    }

    const failed = results.filter((result) => !result.moved).length;
    return {
      moved: results.length - failed,
      failed,
      unreadable,
      results,
    };
  },
);

export default workflow;
