import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Microsoft Excel workbook ID (the OneDrive file the master sheet lives in).
const WORKBOOK_ID = "YOUR_WORKBOOK_ID";
// Worksheet (tab) ID inside that workbook.
const WORKSHEET_ID = "YOUR_WORKSHEET_ID";
// OneDrive folder ID holding the workbook; "root" is the top of the drive.
const FOLDER_ID = "root";
// "one_drive" or "sharepoint".
const STORAGE_SOURCE = "one_drive";

// Column headers in the master sheet. Each must match the worksheet's header row exactly.
const EMPLOYEE_ID_COLUMN = "Employee ID";
const EMPLOYEE_NAME_COLUMN = "Employee Name";
const ABSENCE_TYPE_COLUMN = "Absence Type";
const START_DATE_COLUMN = "Start Date";
const END_DATE_COLUMN = "End Date";
const PROVIDER_COLUMN = "Provider";
const NOTES_COLUMN = "Notes";

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

const workflow = defineDurable<unknown, unknown>(
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

    return { employeeId, row: added.data[0]?.row ?? null };
  },
);

export default workflow;
