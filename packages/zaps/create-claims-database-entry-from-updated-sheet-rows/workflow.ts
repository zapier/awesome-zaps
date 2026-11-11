import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  CLAIMS_TABLE_ID,
  REFERENCE_FIELD,
  CLAIM_ID_COLUMN,
  CLAIMANT_NAME_COLUMN,
  POLICY_NUMBER_COLUMN,
  CLAIM_AMOUNT_COLUMN,
  STATUS_COLUMN,
  RECEIVED_AT_COLUMN,
} from "@/config";

const sdk = createZapierSdk();

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
