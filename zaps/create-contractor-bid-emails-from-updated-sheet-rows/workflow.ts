import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  CONTRACTOR_EMAIL_COLUMN,
  PROJECT_REFERENCE_COLUMN,
  LOCATION_COLUMN,
  PROJECT_DETAILS_COLUMN,
  DESCRIPTION_COLUMN,
  DRAFTED_COLUMN,
  DRAFTED_AT_COLUMN,
  DRAFTED_VALUE,
} from "@/config";
import gmail from "@/connections/gmail";
import googleSheets from "@/connections/google-sheets";

const sdk = createZapierSdk();

// Billing notice added to the end of every draft. Replace with your own wording.
const BILLING_NOTICE =
  "This bid request is for estimating only. Final pricing is confirmed in the signed contract.";

const InputSchema = z
  .object({
    row: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

function cell(input: Record<string, unknown>, key: string): string {
  return String(input[key] ?? "").trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const workflow = defineDurable<unknown, unknown>(
  "create-contractor-bid-emails-from-updated-sheet-rows",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const values = input as Record<string, unknown>;

    const contractorEmail = cell(values, CONTRACTOR_EMAIL_COLUMN);
    const alreadyDrafted = cell(values, DRAFTED_COLUMN) === DRAFTED_VALUE;
    if (!contractorEmail) {
      return { skipped: true, reason: "no-contractor-email", row: input.row };
    }
    if (alreadyDrafted) {
      return { skipped: true, reason: "already-drafted", row: input.row };
    }

    const projectReference = cell(values, PROJECT_REFERENCE_COLUMN);
    const location = cell(values, LOCATION_COLUMN);
    const projectDetails = cell(values, PROJECT_DETAILS_COLUMN);
    const description = cell(values, DESCRIPTION_COLUMN);

    const subject =
      [projectReference, location].filter(Boolean).join(" - ") || "Bid request";
    const body = [
      `<p>Project: ${escapeHtml(projectReference)}</p>`,
      `<p>Location: ${escapeHtml(location)}</p>`,
      `<p>Details: ${escapeHtml(projectDetails)}</p>`,
      `<p>${escapeHtml(description)}</p>`,
      `<p>${escapeHtml(BILLING_NOTICE)}</p>`,
    ].join("");

    const draft = await ctx.step("create-contractor-bid-draft", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "draft_v2",
        connection: gmail,
        inputs: {
          to: [contractorEmail],
          subject,
          body,
          body_type: "html",
        },
      }),
    );

    const draftedAt = await ctx.step("capture-drafted-at", async () =>
      new Date().toISOString(),
    );

    const marked = await ctx.step("mark-row-drafted", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "update_row",
        connection: googleSheets,
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          row: String(input.row),
          [DRAFTED_COLUMN]: DRAFTED_VALUE,
          [DRAFTED_AT_COLUMN]: draftedAt,
        },
      }),
    );

    return {
      row: input.row,
      contractorEmail,
      subject,
      draftedAt,
      draft: draft.data?.[0] ?? null,
      marked: marked.data?.[0] ?? null,
    };
  },
);

export default workflow;
