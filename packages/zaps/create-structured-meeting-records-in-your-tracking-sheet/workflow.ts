import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  EVENT_ID_COLUMN,
  TITLE_COLUMN,
  ORGANIZER_COLUMN,
  START_COLUMN,
  ATTENDEES_COLUMN,
  CREATED_COLUMN,
  UPDATED_COLUMN,
} from "@/config";
import googleSheets from "@/connections/google-sheets";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    organizer__email: z.string().nullable().optional(),
    start__dateTime: z.string().nullable().optional(),
    attendee_emails: z.string().nullable().optional(),
    created: z.string().nullable().optional(),
    updated: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-structured-meeting-records-in-your-tracking-sheet",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const eventId = input.id?.trim();
    if (!eventId) {
      return { skipped: true, reason: "event-has-no-id" };
    }

    // Formatting is deterministic, so it stays outside the step: the start time keeps the calendar's own offset, and missing text fields become empty cells.
    const record = {
      [EVENT_ID_COLUMN]: eventId,
      [TITLE_COLUMN]: input.summary ?? "(no title)",
      [ORGANIZER_COLUMN]: input.organizer__email ?? "",
      [START_COLUMN]: input.start__dateTime ?? "",
      [ATTENDEES_COLUMN]: input.attendee_emails ?? "",
      [CREATED_COLUMN]: input.created ?? "",
      [UPDATED_COLUMN]: input.updated ?? "",
    };

    const row = await ctx.step("append-meeting-record", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: googleSheets,
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          ...record,
        },
      }),
    );

    return { eventId, row: row.data?.[0] ?? null };
  },
);

export default workflow;
