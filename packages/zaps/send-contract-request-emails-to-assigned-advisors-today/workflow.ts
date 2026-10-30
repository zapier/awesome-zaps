import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Sheets spreadsheet ID (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Row field holding the assigned advisor's email address (the To recipient).
const ADVISOR_EMAIL_FIELD = "advisor_email";
// Row fields holding requester or collaborator emails (CC recipients).
const COLLABORATOR_EMAIL_FIELDS = ["requester_email"];
// Row fields used to build the subject line.
const ORGANIZATION_FIELD = "organization";
const TITLE_FIELD = "title";
const DATE_FIELD = "date";
// Row fields placed in the email body.
const PLANNER_FIELD = "planner";
const REQUEST_DETAILS_FIELD = "request_details";
// Sender address for shared-mailbox sends; leave "" to send from the connected Outlook account.
const SENDER_ADDRESS = "";

const InputSchema = z.looseObject({});

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const field = (row: Record<string, unknown>, key: string) =>
  String(row[key] ?? "").trim();

const workflow = defineDurable<unknown, unknown>(
  "send-contract-request-emails-to-assigned-advisors-today",
  async (ctx, rawInput) => {
    const row = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    ) as Record<string, unknown>;

    const advisorEmail = field(row, ADVISOR_EMAIL_FIELD);
    if (!advisorEmail) {
      return { skipped: true, reason: "no-advisor-email" };
    }

    const collaborators = COLLABORATOR_EMAIL_FIELDS.map((key) =>
      field(row, key),
    ).filter(Boolean);

    const subject =
      [
        field(row, ORGANIZATION_FIELD),
        field(row, TITLE_FIELD),
        field(row, DATE_FIELD),
      ]
        .filter(Boolean)
        .join(" - ") || "Contract review request";

    const body = [
      `<p>A contract request has been assigned to you for review.</p>`,
      `<p><strong>Planner:</strong> ${escapeHtml(field(row, PLANNER_FIELD))}</p>`,
      `<p><strong>Request details:</strong> ${escapeHtml(field(row, REQUEST_DETAILS_FIELD))}</p>`,
    ].join("");

    const sent = await ctx.step("send-advisor-email", async () =>
      sdk.runAction({
        appKey: "microsoft-outlook",
        actionType: "write",
        actionKey: "send_email",
        connection: "microsoft-outlook",
        inputs: {
          recipients: [advisorEmail],
          ccRecipients: collaborators.length ? collaborators : undefined,
          sender: SENDER_ADDRESS || undefined,
          subject,
          body,
          bodyFormat: "HTML",
        },
      }),
    );

    return {
      sentTo: advisorEmail,
      cc: collaborators,
      subject,
      sent: sent.data?.[0] ?? null,
    };
  },
);

export default workflow;
