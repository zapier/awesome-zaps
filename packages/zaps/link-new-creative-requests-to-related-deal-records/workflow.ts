import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// monday.com board ID of the creative requests board (the board the trigger watches).
const REQUESTS_BOARD_ID = "YOUR_REQUESTS_BOARD_ID";
// monday.com board ID of the deal tracker to search for a matching deal.
const DEAL_BOARD_ID = "YOUR_DEAL_BOARD_ID";
// Column on the deal board to match the search token against (name column key).
const DEAL_NAME_COLUMN = "name";
// Board-relation column on the requests board that links to the matched deal.
const RELATION_COLUMN_ID = "YOUR_DEAL_RELATION_COLUMN_ID";

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    name: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "link-new-creative-requests-to-related-deal-records",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const title = input.name ?? "";
    const token = title
      .replace(/[-_/|,]+/g, " ")
      .trim()
      .split(/\s+/)[0];
    if (!token) {
      return { skipped: true, reason: "empty-title", itemId: input.id };
    }

    const matches = await ctx.step("find-matching-deal", async () =>
      sdk.runAction({
        appKey: "monday",
        actionType: "search",
        actionKey: "find_items",
        connection: "monday",
        inputs: {
          board_id: DEAL_BOARD_ID,
          column_id: DEAL_NAME_COLUMN,
          value: token,
          include_updates: false,
          include_subitems: false,
        },
      }),
    );

    const deal = matches.data[0] as { id?: number | string } | undefined;
    if (!deal?.id) {
      return {
        skipped: true,
        reason: "no-deal-match",
        itemId: input.id,
        token,
      };
    }

    const linked = await ctx.step("link-request-to-deal", async () =>
      sdk.runAction({
        appKey: "monday",
        actionType: "write",
        actionKey: "change_multiple_columns_value",
        connection: "monday",
        inputs: {
          item_id: Number(input.id),
          board_id: Number(REQUESTS_BOARD_ID),
          [RELATION_COLUMN_ID]: { item_ids: [Number(deal.id)] },
        },
      }),
    );

    return {
      itemId: input.id,
      dealId: deal.id,
      token,
      updated: linked.data?.[0] ?? null,
    };
  },
);

export default workflow;
