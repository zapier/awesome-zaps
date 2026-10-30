import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Microsoft Excel workbook ID. Set it in the trigger's Workbook field too; the code does not read it.
const WORKBOOK_ID = "YOUR_WORKBOOK_ID";
// Worksheet ID inside the workbook. Set it in the trigger's Worksheet field too; the code does not read it.
const WORKSHEET_ID = "YOUR_WORKSHEET_ID";
// Excel table ID new rows come from. Set it in the trigger's Table field too; the code does not read it.
const EXCEL_TABLE_ID = "YOUR_EXCEL_TABLE_ID";
// Zapier Table that receives one legal entry record per row.
const LEGAL_ENTRIES_TABLE_ID = "YOUR_LEGAL_ENTRIES_TABLE_ID";
// Excel column headers the row is read from. Check them against the sheet's header row.
const TITLE_COLUMN = "Title";
const SUBMISSION_ID_COLUMN = "Submission ID";
const NOTES_COLUMN = "Notes";
const PRIORITY_COLUMN = "Priority";

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
        connection: "zapier-tables",
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
