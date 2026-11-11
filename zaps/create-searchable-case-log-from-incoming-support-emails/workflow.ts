import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  MESSAGE_ID_COLUMN,
  THREAD_ID_COLUMN,
  SENDER_NAME_COLUMN,
  SENDER_EMAIL_COLUMN,
  SUBJECT_COLUMN,
  SUMMARY_COLUMN,
  REFERENCE_COLUMN,
  HAS_ATTACHMENTS_COLUMN,
  RECEIVED_AT_COLUMN,
  LOGGED_AT_COLUMN,
} from "@/config";
import googleSheets from "@/connections/google-sheets";

const sdk = createZapierSdk();

// Shortest run of digits that counts as a case reference (shorter numbers are ignored).
const MIN_REFERENCE_DIGITS = 5;

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    message_id: z.string().nullable().optional(),
    thread_id: z.string().nullable().optional(),
    from: z
      .object({
        name: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
    subject: z.string().nullable().optional(),
    body_plain: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
    attachment_count: z.union([z.number(), z.string()]).nullable().optional(),
    raw: z
      .object({
        snippet: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

function decodeEntities(text: string): string {
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function findReference(text: string): string | null {
  const match = text.match(new RegExp(`\\d{${MIN_REFERENCE_DIGITS},}`));
  return match ? match[0] : null;
}

const workflow = defineDurable<unknown, unknown>(
  "create-searchable-case-log-from-incoming-support-emails",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const messageId = input.message_id ?? input.id ?? null;
    if (!messageId) {
      return { skipped: true, reason: "no-message-id" };
    }

    const subject = input.subject ?? "";
    const snippet = decodeEntities(input.raw?.snippet ?? "");
    const body = input.body_plain ?? snippet;
    // Numbers in the subject win over numbers in the body.
    const reference = findReference(subject) ?? findReference(body) ?? "";
    // Gmail can wrap display names in quotes ("Jane Doe").
    const senderName = (input.from?.name ?? "").replace(/^"(.*)"$/, "$1");
    const attachmentCount = Number(input.attachment_count ?? 0) || 0;
    const receivedAt = input.date ?? "";

    const existing = await ctx.step("find-existing-case-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "lookup_row",
        connection: googleSheets,
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          lookup_key: MESSAGE_ID_COLUMN,
          lookup_value: messageId,
        },
      }),
    );

    const existingRow = existing.data?.[0] as
      { id?: number | string } | undefined;
    if (existingRow?.id) {
      return {
        skipped: true,
        reason: "already-logged",
        messageId,
        row: existingRow.id,
      };
    }

    const loggedAt = await ctx.step("capture-logged-at", async () =>
      new Date().toISOString(),
    );

    const created = await ctx.step("append-case-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: googleSheets,
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          [MESSAGE_ID_COLUMN]: messageId,
          [THREAD_ID_COLUMN]: input.thread_id ?? "",
          [SENDER_NAME_COLUMN]: senderName,
          [SENDER_EMAIL_COLUMN]: input.from?.email ?? "",
          [SUBJECT_COLUMN]: subject,
          [SUMMARY_COLUMN]: snippet,
          [REFERENCE_COLUMN]: reference,
          [HAS_ATTACHMENTS_COLUMN]: attachmentCount > 0 ? "Yes" : "No",
          [RECEIVED_AT_COLUMN]: receivedAt,
          [LOGGED_AT_COLUMN]: loggedAt,
        },
      }),
    );

    const row = created.data?.[0] as
      { id?: number | string; row?: number | string } | undefined;
    return {
      messageId,
      reference: reference || null,
      row: row?.row ?? row?.id ?? null,
    };
  },
);

export default workflow;
