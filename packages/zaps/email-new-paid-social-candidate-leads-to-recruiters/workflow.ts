import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Sheets spreadsheet ID (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID the lead rows are appended to; the first tab is "0".
const WORKSHEET_ID = "0";
// Recruiter addresses that get the alert email. Send-from is the connected Outlook account.
const RECRUITER_EMAILS = ["YOUR_RECRUITER_EMAIL@example.com"];
// Keys of the lead fields in the Facebook Lead Ads payload. Confirm these against a real lead before publishing.
const FIELD_KEYS = {
  submissionId: "id",
  name: "full_name",
  phone: "phone_number",
  email: "email",
  yearsExperience: "years_of_experience",
  certifications: "certifications",
};
// Sheet columns, in order: A submission ID, B name, C phone, D email, E years, F certifications, G logged at.
const COLUMNS = ["COL$A", "COL$B", "COL$C", "COL$D", "COL$E", "COL$F", "COL$G"];

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const text = (value: unknown) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const workflow = defineDurable<unknown, unknown>(
  "email-new-paid-social-candidate-leads-to-recruiters",
  async (ctx, rawInput) => {
    const payload = z
      .record(z.string(), z.unknown())
      .parse(typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput);

    const submissionId = text(payload[FIELD_KEYS.submissionId]);
    if (!submissionId) {
      return { skipped: true, reason: "no-submission-id" };
    }

    // Formatter steps: plain string handling, no external calls.
    const lead = {
      submissionId,
      name: text(payload[FIELD_KEYS.name]),
      phone: text(payload[FIELD_KEYS.phone]).replace(/[^\d+]/g, ""),
      email: text(payload[FIELD_KEYS.email]).toLowerCase(),
      yearsExperience:
        text(payload[FIELD_KEYS.yearsExperience]).match(/\d+(\.\d+)?/)?.[0] ??
        "",
      certifications: Array.isArray(payload[FIELD_KEYS.certifications])
        ? (payload[FIELD_KEYS.certifications] as unknown[]).map(text).join("; ")
        : text(payload[FIELD_KEYS.certifications]),
    };

    const loggedAt = await ctx.step("capture-logged-at", async () =>
      new Date().toISOString(),
    );

    const row = [
      lead.submissionId,
      lead.name,
      lead.phone,
      lead.email,
      lead.yearsExperience,
      lead.certifications,
      loggedAt,
    ];
    const columns = Object.fromEntries(
      COLUMNS.map((column, index) => [column, row[index]]),
    );

    await ctx.step("append-lead-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          ...columns,
        },
      }),
    );

    const sheetLink = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${WORKSHEET_ID}`;
    const summary = [
      ["Name", lead.name],
      ["Phone", lead.phone],
      ["Email", lead.email],
      ["Years of experience", lead.yearsExperience],
      ["Certifications", lead.certifications],
    ]
      .map(
        ([label, value]) =>
          `<li><strong>${label}:</strong> ${escapeHtml(value || "not given")}</li>`,
      )
      .join("");
    const body = `<p>New candidate lead from paid social.</p><ul>${summary}</ul><p><a href="${escapeHtml(sheetLink)}">Open the recruiting sheet (row logged ${escapeHtml(loggedAt)})</a></p>`;

    const email = await ctx.step("email-recruiters", async () =>
      sdk.runAction({
        appKey: "microsoft-outlook",
        actionType: "write",
        actionKey: "send_email",
        connection: "microsoft-outlook",
        inputs: {
          recipients: RECRUITER_EMAILS,
          subject: `New candidate lead: ${lead.name || lead.submissionId}`,
          bodyFormat: "HTML",
          body,
        },
      }),
    );

    return {
      submissionId,
      emailed: RECRUITER_EMAILS.length,
      sent: email.data?.[0] ?? null,
    };
  },
);

export default workflow;
