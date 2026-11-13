import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  WORKBOOK_ID,
  WORKSHEET_ID,
  FOLDER_ID,
  STORAGE_SOURCE,
  EMPLOYEE_ID_COLUMN,
  EMPLOYEE_NAME_COLUMN,
  ABSENCE_TYPE_COLUMN,
  START_DATE_COLUMN,
  END_DATE_COLUMN,
  PROVIDER_COLUMN,
  NOTES_COLUMN,
} from "./config.ts";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    employee_id: z.union([z.string(), z.number()]),
    employee_name: z.string().nullable().optional(),
    absence_type: z.string().nullable().optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    provider: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .loose();

// Collapse runs of whitespace and trim; empty values become "".
function cleanText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

// Turn YYYY-MM-DD into DD/MM/YYYY. Anything else is passed through unchanged.
function toDayMonthYear(value: string | null | undefined): string {
  const cleaned = cleanText(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(cleaned);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : cleaned;
}

const workflow = defineDurable(
  "add-processed-employee-leave-records-to-master-spreadsheet",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const employeeId = String(input.employee_id).trim();
    const row = {
      [EMPLOYEE_ID_COLUMN]: employeeId,
      [EMPLOYEE_NAME_COLUMN]: cleanText(input.employee_name),
      [ABSENCE_TYPE_COLUMN]: cleanText(input.absence_type),
      [START_DATE_COLUMN]: toDayMonthYear(input.start_date),
      [END_DATE_COLUMN]: toDayMonthYear(input.end_date),
      [PROVIDER_COLUMN]: cleanText(input.provider),
      [NOTES_COLUMN]: cleanText(input.notes),
    };

    const added = await ctx.step("add-leave-row-to-spreadsheet", async () =>
      sdk.runAction({
        appKey: "excel",
        actionType: "write",
        actionKey: "add_row",
        connection: "excel",
        inputs: {
          folder_id: FOLDER_ID,
          workbook_id: WORKBOOK_ID,
          worksheet_id: WORKSHEET_ID,
          storage_source: STORAGE_SOURCE,
          ...row,
        },
      }),
    );

    return {
      employeeId,
      row: (added.data[0] as { row?: unknown } | undefined)?.row ?? null,
    };
  },
);

export default workflow;
