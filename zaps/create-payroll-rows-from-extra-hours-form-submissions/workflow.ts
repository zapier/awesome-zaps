import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  PAYROLL_EMAIL,
  WORKER_NAME_REF,
  DATE_REF,
  HOURS_REF,
  NOTES_REF,
  SUBMISSION_ID_COLUMN,
  NAME_COLUMN,
  DATE_COLUMN,
  HOURS_COLUMN,
  DESCRIPTION_COLUMN,
} from "./config.ts";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    id: z.string(),
    submitted_at: z.string().nullable().optional(),
    answers: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
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
