import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  BOARD_ID,
  BRAND_COLUMN_ID,
  TITLE_PART_COLUMN_IDS,
  TITLE_SEPARATOR,
} from "./config.ts";

const sdk = createZapierSdk();

// Start of the update note posted when an item is renamed. The new name is appended.
const CHANGE_NOTE =
  "Item name updated automatically when Brand was set. New name:";

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    item_id: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

type ColumnValue = { id?: string | null; text?: string | null };

const workflow = defineDurable(
  "update-program-item-names-when-brand-is-set",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const itemId = String(input.id ?? input.item_id ?? "").trim();
    if (!itemId) {
      return { skipped: true, reason: "no-item-id" };
    }

    const columns = await ctx.step("get-item-column-values", async () =>
      sdk.runAction({
        appKey: "monday",
        actionType: "search",
        actionKey: "get_column_values",
        connection: "monday",
        inputs: {
          board_id: BOARD_ID,
          item_id: itemId,
          column_id: [BRAND_COLUMN_ID, ...TITLE_PART_COLUMN_IDS],
        },
      }),
    );

    const values = (columns.data ?? []) as ColumnValue[];
    const textFor = (columnId: string) =>
      (values.find((column) => column.id === columnId)?.text ?? "").trim();

    const brand = textFor(BRAND_COLUMN_ID);
    if (!brand) {
      return { skipped: true, reason: "brand-empty", itemId };
    }

    const newName = [...TITLE_PART_COLUMN_IDS.map(textFor), brand]
      .filter(Boolean)
      .join(TITLE_SEPARATOR);

    const rename = await ctx.step("rename-item", async () =>
      sdk.runAction({
        appKey: "monday",
        actionType: "write",
        actionKey: "change_item_name_column_value",
        connection: "monday",
        inputs: {
          board_id: BOARD_ID,
          item_id: Number(itemId),
          value_item_name: newName,
        },
      }),
    );

    const note = await ctx.step("add-rename-note", async () =>
      sdk.runAction({
        appKey: "monday",
        actionType: "write",
        actionKey: "create_update",
        connection: "monday",
        inputs: {
          item_id: Number(itemId),
          body: `${CHANGE_NOTE} ${newName}`,
        },
      }),
    );

    return {
      itemId,
      newName,
      renamed: rename.data?.[0] ?? null,
      note: note.data?.[0] ?? null,
    };
  },
);

export default workflow;
