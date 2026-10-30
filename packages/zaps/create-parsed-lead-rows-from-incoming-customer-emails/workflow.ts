import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Sheets spreadsheet ID (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Google Drive location of the spreadsheet; "" is My Drive.
const DRIVE_ID = "";
// Case-insensitive pattern a message's subject or body preview must match to be logged.
const LEAD_PATTERN = "lead|inquiry|quote request";
// Column for the date the message was received (COL$A = column A).
const DATE_COLUMN = "COL$A";
// Column for the short description of the lead.
const DESCRIPTION_COLUMN = "COL$B";
// Column for the customer note and first token from the message.
const DETAILS_COLUMN = "COL$C";
// Column for the source identifier (the Outlook message ID), also used to match duplicates.
const SOURCE_COLUMN = "COL$D";

const InputSchema = z
  .object({
    id: z.string(),
    subject: z.string().nullable().optional(),
    bodyPreview: z.string().nullable().optional(),
    receivedDateTime: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-parsed-lead-rows-from-incoming-customer-emails",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const messageId = String(input.id).trim();
    const subject = input.subject ?? "";
    const preview = (input.bodyPreview ?? "").replace(/\s+/g, " ").trim();

    if (!new RegExp(LEAD_PATTERN, "i").test(`${subject} ${preview}`)) {
      return { skipped: true, reason: "not-a-lead-email", messageId };
    }

    const existing = await ctx.step("find-existing-lead-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "lookup_row",
        connection: "google-sheets",
        inputs: {
          drive: DRIVE_ID,
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          lookup_key: SOURCE_COLUMN,
          lookup_value: messageId,
        },
      }),
    );

    if (existing.data?.[0]?.id) {
      return { skipped: true, reason: "duplicate-message", messageId };
    }

    const receivedAt = new Date(input.receivedDateTime ?? Date.now());
    const formattedDate = receivedAt
      .toISOString()
      .slice(0, 16)
      .replace("T", " ");

    const sentences = preview.split(/(?<=[.!?])\s/);
    const shortDescription = (sentences[0] ?? "").slice(0, 200);
    const firstToken = preview.split(" ")[0] ?? "";
    const details = `first word: ${firstToken}; note: ${preview.slice(0, 500)}`;

    const row = await ctx.step("create-lead-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          drive: DRIVE_ID,
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          [DATE_COLUMN]: formattedDate,
          [DESCRIPTION_COLUMN]: shortDescription,
          [DETAILS_COLUMN]: details,
          [SOURCE_COLUMN]: messageId,
        },
      }),
    );

    return { messageId, formattedDate, created: row.data?.[0] ?? null };
  },
);

export default workflow;
