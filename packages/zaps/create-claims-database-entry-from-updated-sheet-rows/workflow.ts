import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Sheets spreadsheet ID (the long ID in the sheet's URL). Also used to build the link back to the row.
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Zapier Table ID for the claims database (the table's ID from its URL).
const CLAIMS_TABLE_ID = "YOUR_TABLE_ID";
// Table field key that holds the claim ID. A claim already in the table is skipped. "f1" is the table's first field.
const REFERENCE_FIELD = "f1";
// Sheet column keys (COL$A = column A) for the claim fields. Map these to your sheet's column letters.
const CLAIM_ID_COLUMN = "COL$A";
const CLAIMANT_NAME_COLUMN = "COL$B";
const POLICY_NUMBER_COLUMN = "COL$C";
const CLAIM_AMOUNT_COLUMN = "COL$D";
const STATUS_COLUMN = "COL$E";
const RECEIVED_AT_COLUMN = "COL$F";

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    row: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

function text(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

const workflow = defineDurable<unknown, unknown>(
  "create-claims-database-entry-from-updated-sheet-rows",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const claimId = text(input[CLAIM_ID_COLUMN]);
    if (!claimId) {
      return { skipped: true, reason: "missing-claim-id" };
    }

    const existing = await ctx.step("find-existing-claim-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        inputs: {
          table_id: CLAIMS_TABLE_ID,
          filter_count: "1",
          field_data_key: REFERENCE_FIELD,
          operator: "exact",
          lookup_value: claimId,
        },
      }),
    );
    if (existing.data.length > 0) {
      return { skipped: true, reason: "claim-already-in-table", claimId };
    }

    const rowNumber = text(input.row ?? input.id);
    const sheetRowLink = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${WORKSHEET_ID}&range=${rowNumber}:${rowNumber}`;

    const created = await ctx.step("create-claims-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "create_record",
        inputs: {
          table_id: CLAIMS_TABLE_ID,
          new__data__f1: claimId,
          new__data__f2: text(input[CLAIMANT_NAME_COLUMN]),
          new__data__f3: text(input[POLICY_NUMBER_COLUMN]),
          new__data__f4: text(input[CLAIM_AMOUNT_COLUMN]),
          new__data__f5: text(input[STATUS_COLUMN]),
          new__data__f6: text(input[RECEIVED_AT_COLUMN]) || "now",
          new__data__f7: sheetRowLink,
        },
      }),
    );

    return {
      skipped: false,
      claimId,
      sheetRowLink,
      record: created.data[0] ?? null,
    };
  },
);

export default workflow;
