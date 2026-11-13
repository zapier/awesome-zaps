import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  BOARD_ID,
  ALLOCATION_COLUMN_ID,
  TOTAL_PERCENTAGE_COLUMN_ID,
  SPLIT_1_COLUMN_ID,
  SPLIT_2_COLUMN_ID,
  SPLIT_3_COLUMN_ID,
  SPLIT_4_COLUMN_ID,
  SPLIT_5_COLUMN_ID,
} from "./config.ts";

const sdk = createZapierSdk();

// Split percentage columns, one per contributor slot, in order. Up to 5 contributors.
const SPLIT_COLUMN_IDS = [
  SPLIT_1_COLUMN_ID,
  SPLIT_2_COLUMN_ID,
  SPLIT_3_COLUMN_ID,
  SPLIT_4_COLUMN_ID,
  SPLIT_5_COLUMN_ID,
];

const InputSchema = z
  .object({
    item_id: z.union([z.string(), z.number()]),
    column_id: z.string().nullable().optional(),
    contributor_count: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "apply-splits-on-copyright-change-for-song-entries",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    if (input.column_id !== ALLOCATION_COLUMN_ID) {
      return { skipped: true, reason: "other-column-changed" };
    }

    const contributors = Number(input.contributor_count ?? 0);
    if (contributors < 1) {
      return { skipped: true, reason: "no-contributors" };
    }
    if (contributors > SPLIT_COLUMN_IDS.length) {
      return { skipped: true, reason: "too-many-contributors", contributors };
    }

    // Round down to two decimals so 3 contributors get 33.33 and 6 get 16.66.
    const share = Math.floor(10000 / contributors) / 100;
    const total = Number((share * contributors).toFixed(2));

    const splitValues = Object.fromEntries(
      SPLIT_COLUMN_IDS.slice(0, contributors).map((columnId) => [
        columnId,
        share,
      ]),
    );

    const update = await ctx.step("update-split-percentages", async () =>
      sdk.runAction({
        appKey: "monday",
        actionType: "write",
        actionKey: "change_multiple_columns_value",
        connection: "monday",
        inputs: {
          item_id: String(input.item_id),
          board_id: BOARD_ID,
          [TOTAL_PERCENTAGE_COLUMN_ID]: total,
          ...splitValues,
        },
      }),
    );

    return {
      itemId: input.item_id,
      contributors,
      share,
      total,
      updated: update.data?.[0] ?? null,
    };
  },
);

export default workflow;
