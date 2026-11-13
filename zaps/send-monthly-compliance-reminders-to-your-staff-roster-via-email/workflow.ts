import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  ROSTER_RANGE,
  EMAIL_COLUMN,
  FILE_LINK_COLUMN,
  TO_ADDRESS,
  SUBJECT_PREFIX,
  SUBJECT,
} from "./config.ts";

const sdk = createZapierSdk();

// Maximum roster rows read per run (Google Sheets allows up to 1,500).
const MAX_ROSTER_ROWS = 1500;
// Body of the reminder email. Replace with your own wording.
const BODY =
  "Please review the attached policies and confirm you have read them by the monthly deadline.";

const RosterRowSchema = z.record(z.string(), z.unknown());

const workflow = defineDurable(
  "send-monthly-compliance-reminders-to-your-staff-roster-via-email",
  async (ctx) => {
    const lookup = await ctx.step("read-roster-rows", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "get_many_rows",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          range: ROSTER_RANGE,
          first_row: 2,
          row_count: MAX_ROSTER_ROWS,
          output_format: "formatted_rows",
        },
      }),
    );

    const formatted = (lookup.data?.[0] ?? {}) as {
      formatted_rows?: unknown[];
    };
    const roster = (formatted.formatted_rows ?? []).map((row) =>
      RosterRowSchema.parse(row),
    );
    const complete = roster.filter(
      (row) => String(row[EMAIL_COLUMN] ?? "").trim() !== "",
    );
    if (complete.length === 0) {
      return { skipped: true, reason: "no-roster-rows-with-email" };
    }

    const bccRecipients = [
      ...new Set(complete.map((row) => String(row[EMAIL_COLUMN]).trim())),
    ];
    const attachments = [
      ...new Set(
        complete
          .map((row) => String(row[FILE_LINK_COLUMN] ?? "").trim())
          .filter((link) => link !== ""),
      ),
    ];

    const sent = await ctx.step("send-compliance-reminder-email", async () =>
      sdk.runAction({
        appKey: "microsoft-outlook",
        actionType: "write",
        actionKey: "send_email",
        connection: "microsoft-outlook",
        inputs: {
          recipients: [TO_ADDRESS],
          bccRecipients,
          subject: `${SUBJECT_PREFIX}${SUBJECT}`,
          body: BODY,
          bodyFormat: "Text",
          file: attachments,
        },
      }),
    );

    return {
      sent: true,
      bccCount: bccRecipients.length,
      attachmentCount: attachments.length,
      messageId: sent.data?.[0] ?? null,
    };
  },
);

export default workflow;
