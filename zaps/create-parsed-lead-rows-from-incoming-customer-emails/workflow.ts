import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  DRIVE_ID,
  LEAD_PATTERN,
  DATE_COLUMN,
  DESCRIPTION_COLUMN,
  DETAILS_COLUMN,
  SOURCE_COLUMN,
} from "./config.ts";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    id: z.string(),
    subject: z.string().nullable().optional(),
    bodyPreview: z.string().nullable().optional(),
    receivedDateTime: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
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
