import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Sheets spreadsheet ID of the vendor alert tracker (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID the trigger watches; the first tab is "0".
const WORKSHEET_ID = "0";
// Column holding the vendor name (COL$A = column A).
const VENDOR_COLUMN = "COL$A";
// Column holding the alert title, used as the email subject.
const TITLE_COLUMN = "COL$B";
// Column holding the short summary, used in the subject and body.
const SUMMARY_COLUMN = "COL$C";
// Column holding the longer details, excerpted in the body.
const DETAILS_COLUMN = "COL$D";
// Column that flags a row as an alert.
const ALERT_COLUMN = "COL$E";
// Values in ALERT_COLUMN that count as an alert (compared case-insensitively).
const ALERT_VALUES = ["yes", "y", "true", "x", "alert"];
// Column holding a per-row recipient list (comma or semicolon separated); blank uses DEFAULT_RECIPIENTS.
const RECIPIENTS_COLUMN = "COL$F";
// Crisis team inbox used when a row has no recipients of its own.
const DEFAULT_RECIPIENTS = ["YOUR_CRISIS_TEAM_EMAIL"];
// Maximum characters of the details column quoted in the email.
const EXCERPT_LENGTH = 500;

const InputSchema = z
  .object({
    id: z.union([z.number(), z.string()]).nullable().optional(),
    row: z.union([z.number(), z.string()]).nullable().optional(),
    _content_hash: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "send-real-time-vendor-alerts-to-crisis-team-inbox",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const cell = (key: string) => {
      const value = (input as Record<string, unknown>)[key];
      return value == null ? "" : String(value).trim();
    };

    const rowNumber = input.row ?? input.id ?? null;
    const changeId = `${input.id ?? rowNumber ?? "unknown"}:${input._content_hash ?? "no-hash"}`;

    const alertFlag = cell(ALERT_COLUMN).toLowerCase();
    if (!ALERT_VALUES.includes(alertFlag)) {
      return { skipped: true, reason: "not-an-alert-row", changeId, alertFlag };
    }

    const rowRecipients = cell(RECIPIENTS_COLUMN)
      .split(/[,;]/)
      .map((email) => email.trim())
      .filter(Boolean);
    const recipients = rowRecipients.length
      ? rowRecipients
      : DEFAULT_RECIPIENTS;

    const vendor = cell(VENDOR_COLUMN) || "Unknown vendor";
    const title = cell(TITLE_COLUMN);
    const summary = cell(SUMMARY_COLUMN);
    const details = cell(DETAILS_COLUMN);
    const excerpt =
      details.length > EXCERPT_LENGTH
        ? `${details.slice(0, EXCERPT_LENGTH)}…`
        : details;
    const rowLink = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${WORKSHEET_ID}${rowNumber ? `&range=A${rowNumber}` : ""}`;

    const subject = `[Vendor alert] ${vendor}: ${title || summary || "row updated"}`;
    const body = [
      `Vendor: ${vendor}`,
      title ? `Title: ${title}` : null,
      summary ? `Summary: ${summary}` : null,
      excerpt ? `\nDetails:\n${excerpt}` : null,
      `\nRow: ${rowNumber ?? "unknown"}`,
      `Open the row: ${rowLink}`,
      `Change ID: ${changeId}`,
    ]
      .filter((line) => line !== null)
      .join("\n");

    const email = await ctx.step("send-crisis-alert-email", async () =>
      sdk.runAction({
        appKey: "microsoft-outlook",
        actionType: "write",
        actionKey: "send_email",
        connection: "microsoft-outlook",
        inputs: {
          recipients,
          subject,
          body,
          bodyFormat: "Text",
        },
      }),
    );

    const sent = email.data?.[0] as { id?: string } | undefined;
    return {
      sent: true,
      changeId,
      recipients,
      subject,
      messageId: sent?.id ?? null,
    };
  },
);

export default workflow;
