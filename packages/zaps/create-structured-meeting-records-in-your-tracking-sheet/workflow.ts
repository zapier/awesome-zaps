import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Calendar the trigger watches (the calendar's email or ID). Set the same value in the trigger's Calendar setting. The code does not read it.
const CALENDAR_ID = "YOUR_CALENDAR_ID";
// Google Sheets spreadsheet ID (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID for the meeting audit rows. Use a dedicated tab; the first tab is "0".
const WORKSHEET_ID = "YOUR_WORKSHEET_ID";
// Column for the calendar event ID, used to match events later (COL$A = column A).
const EVENT_ID_COLUMN = "COL$A";
// Column for the event title.
const TITLE_COLUMN = "COL$B";
// Column for the organizer's email.
const ORGANIZER_COLUMN = "COL$C";
// Column for the event start time.
const START_COLUMN = "COL$D";
// Column for the attendee emails, as one comma-separated string.
const ATTENDEES_COLUMN = "COL$E";
// Column for when the event was created.
const CREATED_COLUMN = "COL$F";
// Column for when the event was last updated.
const UPDATED_COLUMN = "COL$G";

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
        connection: "google-sheets",
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
