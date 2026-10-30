import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Sheets spreadsheet ID of the staff roster (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Roster columns: name, email, policy file link (A:C).
const ROSTER_RANGE = "A:C";
// Maximum roster rows read per run (Google Sheets allows up to 1,500).
const MAX_ROSTER_ROWS = 1500;
// Column key of the email column (COL$A = column A, COL$B = column B).
const EMAIL_COLUMN = "COL$B";
// Column key of the policy file-link column.
const FILE_LINK_COLUMN = "COL$C";
// Address in the To field. Roster addresses go in BCC so recipients can't see each other.
const TO_ADDRESS = "YOUR_EMAIL_ADDRESS";
// Prefix added to the subject line; leave empty for production.
const SUBJECT_PREFIX = "";
// Subject of the reminder email.
const SUBJECT = "Monthly policy compliance reminder";
// Body of the reminder email. Replace with your own wording.
const BODY =
  "Please review the attached policies and confirm you have read them by the monthly deadline.";

const RosterRowSchema = z.record(z.string(), z.unknown());

const workflow = defineDurable<unknown, unknown>(
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

    const roster = (lookup.data?.[0]?.formatted_rows ?? []).map((row) =>
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
