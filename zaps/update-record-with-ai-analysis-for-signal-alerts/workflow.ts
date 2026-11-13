import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  TABLE_ID,
  STRATEGY_FIELD,
  ANALYSIS_FIELD,
  REVIEWED_AT_FIELD,
  MARKET_DATA_URL,
  MODEL,
} from "./config.ts";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
  })
  .loose();

const workflow = defineDurable(
  "update-record-with-ai-analysis-for-signal-alerts",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const recordId = String(input.id);
    const strategy = String(input[STRATEGY_FIELD] ?? "").trim();
    if (!strategy) {
      return { skipped: true, reason: "no-strategy-text", recordId };
    }

    const market = await ctx.step("fetch-market-data", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "custom",
        inputs: {
          url: MARKET_DATA_URL,
          method: "GET",
          unflatten: "no",
          return_raw_response: "no",
        },
      }),
    );

    const series = JSON.stringify(market.data?.[0] ?? {}).slice(0, 20000);

    const review = await ctx.step("review-signal-with-ai", async () =>
      sdk.runAction({
        appKey: "chatgpt",
        actionType: "write",
        actionKey: "conversation_responses_api",
        connection: "chatgpt",
        inputs: {
          model: MODEL,
          instructions:
            "You review trading signal alerts against the strategy text. Be concise.",
          user_message: `Strategy:\n${strategy}\n\nRecent price and volume data (JSON):\n${series}\n\nReply with a verdict (BUY, SELL, HOLD or INSUFFICIENT DATA) on the first line, then one short paragraph of reasoning.`,
          response_format: "text",
        },
      }),
    );

    const verdict = String(review.data?.[0]?.output ?? "").trim();

    const reviewedAt = await ctx.step("capture-reviewed-at", async () =>
      new Date().toISOString(),
    );

    const update = await ctx.step("write-analysis-to-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "update_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TABLE_ID,
          record_id: recordId,
          [ANALYSIS_FIELD]: verdict,
          [REVIEWED_AT_FIELD]: reviewedAt,
        },
      }),
    );

    return { recordId, reviewedAt, verdict, updated: update.data?.[0] ?? null };
  },
);

export default workflow;
