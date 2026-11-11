import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  TABLE_ID,
  QUESTION_COLUMN,
  ANSWER_COLUMN,
  QUESTION_FIELD,
  ANSWER_FIELD,
  VERSION_FIELD,
  LAST_EDITED_FIELD,
  SHEET_ROW_FIELD,
} from "@/config";

const sdk = createZapierSdk();

// Sheet column holding the version (metadata); set to null if the sheet has none.
const VERSION_COLUMN: string | null = "COL$C";

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    row: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

type TableRecord = {
  record_id?: string;
  new?: { data?: Record<string, unknown> } | null;
  old?: { data?: Record<string, unknown> } | null;
};

function cell(input: Record<string, unknown>, column: string | null): string {
  if (!column) return "";
  const value = input[column];
  return value === null || value === undefined ? "" : String(value).trim();
}

const workflow = defineDurable<unknown, unknown>(
  "update-chatbot-faq-records-from-edited-sheet-rows",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    ) as Record<string, unknown> & z.infer<typeof InputSchema>;

    const question = cell(input, QUESTION_COLUMN);
    const answer = cell(input, ANSWER_COLUMN);
    const version = cell(input, VERSION_COLUMN);
    const sheetRow = String(input.row ?? input.id ?? "");

    if (!question) {
      return { skipped: true, reason: "row-has-no-question", sheetRow };
    }

    const lookup = await ctx.step("find-faq-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        inputs: {
          table_id: TABLE_ID,
          filter_count: "1",
          field_data_key: QUESTION_FIELD,
          operator: "exact",
          lookup_value: question,
        },
      }),
    );

    const match = lookup.data?.[0] as TableRecord | undefined;
    const existing = match?.new?.data ?? match?.old?.data ?? null;

    if (match?.record_id) {
      const unchanged =
        String(existing?.[ANSWER_FIELD] ?? "").trim() === answer &&
        String(existing?.[VERSION_FIELD] ?? "").trim() === version;
      if (unchanged) {
        return {
          skipped: true,
          reason: "answer-and-metadata-unchanged",
          recordId: match.record_id,
        };
      }
    }

    const syncedAt = await ctx.step("capture-synced-at", async () =>
      new Date().toISOString(),
    );

    // Tables create/update inputs key each field as new__data__<field id>.
    const fields = {
      [`new__data__${QUESTION_FIELD}`]: question,
      [`new__data__${ANSWER_FIELD}`]: answer,
      [`new__data__${VERSION_FIELD}`]: version,
      [`new__data__${LAST_EDITED_FIELD}`]: syncedAt,
      [`new__data__${SHEET_ROW_FIELD}`]: sheetRow,
    };

    if (!match?.record_id) {
      const created = await ctx.step("create-faq-record", async () =>
        sdk.runAction({
          appKey: "zapier-tables",
          actionType: "write",
          actionKey: "create_record",
          inputs: { table_id: TABLE_ID, ...fields },
        }),
      );
      const recordId =
        (created.data?.[0] as TableRecord | undefined)?.record_id ?? null;
      return {
        action: "created",
        recordId,
        question,
        version,
        sheetRow,
        syncedAt,
      };
    }

    await ctx.step("update-faq-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "update_record",
        inputs: { table_id: TABLE_ID, record_id: match.record_id, ...fields },
      }),
    );

    return {
      action: "updated",
      recordId: match.record_id,
      question,
      version,
      sheetRow,
      syncedAt,
    };
  },
);

export default workflow;
