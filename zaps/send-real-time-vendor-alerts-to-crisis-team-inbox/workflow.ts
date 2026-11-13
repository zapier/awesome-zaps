import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  VENDOR_COLUMN,
  TITLE_COLUMN,
  SUMMARY_COLUMN,
  DETAILS_COLUMN,
  ALERT_COLUMN,
  RECIPIENTS_COLUMN,
} from "./config.ts";

const sdk = createZapierSdk();

// Values in ALERT_COLUMN that count as an alert (compared case-insensitively).
const ALERT_VALUES = ["yes", "y", "true", "x", "alert"];
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

const workflow = defineDurable(
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
