import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Typeform form ID of the extra-hours form (also set as the trigger's formId).
const FORM_ID = "YOUR_TYPEFORM_FORM_ID";
// Google Sheets spreadsheet ID (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Email address the payroll clerk notification is sent to.
const PAYROLL_EMAIL = "YOUR_PAYROLL_EMAIL";
// Typeform question refs for the form fields (replace with the refs in your form).
const WORKER_NAME_REF = "YOUR_WORKER_NAME_QUESTION_REF";
const DATE_REF = "YOUR_DATE_QUESTION_REF";
const HOURS_REF = "YOUR_HOURS_QUESTION_REF";
const NOTES_REF = "YOUR_NOTES_QUESTION_REF";
// Sheet columns (COL$A = column A).
const SUBMISSION_ID_COLUMN = "COL$A";
const NAME_COLUMN = "COL$B";
const DATE_COLUMN = "COL$C";
const HOURS_COLUMN = "COL$D";
const DESCRIPTION_COLUMN = "COL$E";

const InputSchema = z
  .object({
    id: z.string(),
    submitted_at: z.string().nullable().optional(),
    answers: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-payroll-rows-from-extra-hours-form-submissions",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const submissionId = String(input.id).trim();
    const answers = (input.answers ?? {}) as Record<string, unknown>;
    const answer = (ref: string) =>
      answers[ref] == null ? "" : String(answers[ref]);

    const values = {
      [SUBMISSION_ID_COLUMN]: submissionId,
      [NAME_COLUMN]: answer(WORKER_NAME_REF),
      [DATE_COLUMN]: answer(DATE_REF),
      [HOURS_COLUMN]: answer(HOURS_REF),
      [DESCRIPTION_COLUMN]: answer(NOTES_REF),
    };

    const lookup = await ctx.step("find-submission-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "lookup_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          lookup_key: SUBMISSION_ID_COLUMN,
          lookup_value: submissionId,
        },
      }),
    );

    const existing = lookup.data?.[0] as { id?: number | string } | undefined;

    const row = existing?.id
      ? await ctx.step("update-payroll-row", async () =>
          sdk.runAction({
            appKey: "google-sheets",
            actionType: "write",
            actionKey: "update_row",
            connection: "google-sheets",
            inputs: {
              spreadsheet: SPREADSHEET_ID,
              worksheet: WORKSHEET_ID,
              row: String(existing.id),
              ...values,
            },
          }),
        )
      : await ctx.step("create-payroll-row", async () =>
          sdk.runAction({
            appKey: "google-sheets",
            actionType: "write",
            actionKey: "add_row",
            connection: "google-sheets",
            inputs: {
              spreadsheet: SPREADSHEET_ID,
              worksheet: WORKSHEET_ID,
              ...values,
            },
          }),
        );

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${WORKSHEET_ID}`;
    const subject = `Extra hours submission ${submissionId} needs payroll review`;
    const body = [
      `Submission reference: ${submissionId}`,
      `Worker: ${values[NAME_COLUMN]}`,
      `Date: ${values[DATE_COLUMN]}`,
      `Hours: ${values[HOURS_COLUMN]}`,
      `Sheet: ${sheetUrl}`,
    ].join("\n");

    const notification = await ctx.step("notify-payroll-clerks", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: PAYROLL_EMAIL,
          subject,
          body,
          body_type: "plain",
        },
      }),
    );

    return {
      submissionId,
      action: existing?.id ? "updated" : "created",
      row: row.data?.[0] ?? null,
      notification: notification.data?.[0] ?? null,
    };
  },
);

export default workflow;
