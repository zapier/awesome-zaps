import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  LEGAL_ENTRIES_TABLE_ID,
  TITLE_COLUMN,
  SUBMISSION_ID_COLUMN,
  NOTES_COLUMN,
  PRIORITY_COLUMN,
} from "@/config";
import zapierTables from "@/connections/zapier-tables";

const sdk = createZapierSdk();

const InputSchema = z.record(z.string(), z.unknown());

function textOf(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

const workflow = defineDurable<unknown, unknown>(
  "log-legal-entries-from-new-spreadsheet-rows-automatically",
  async (ctx, rawInput) => {
    const row = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const title = textOf(row[TITLE_COLUMN]);
    const submissionId = textOf(row[SUBMISSION_ID_COLUMN]);
    if (!title || !submissionId) {
      return { skipped: true, reason: "missing-title-or-submission-id" };
    }

    const record = await ctx.step("create-legal-entry-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "create_record",
        connection: zapierTables,
        inputs: {
          table_id: LEGAL_ENTRIES_TABLE_ID,
          new__data__f1: title,
          new__data__f2: submissionId,
          new__data__f3: textOf(row[NOTES_COLUMN]),
          new__data__f4: textOf(row[PRIORITY_COLUMN]),
        },
      }),
    );

    return { submissionId, created: record.data[0] ?? null };
  },
);

export default workflow;
