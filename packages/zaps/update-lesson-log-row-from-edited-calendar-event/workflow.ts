import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// The calendar is set in the trigger config (`calendarid` on Google Calendar's
// "New or Updated Event" trigger), not in this file.
// Google Sheets spreadsheet ID (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Column holding the calendar event ID the row is matched on (COL$A = column A).
const EVENT_ID_COLUMN = "COL$A";
// Column for the session date, taken from the event's start.
const DATE_COLUMN = "COL$B";
// Column for the session duration in minutes.
const DURATION_COLUMN = "COL$C";
// Column for the session summary, taken from the event title.
const SUMMARY_COLUMN = "COL$D";
// Column for the session notes, taken from the event description.
const NOTES_COLUMN = "COL$E";

const InputSchema = z
  .object({
    id: z.string(),
    summary: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    start: z
      .object({ dateTime: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
    duration_minutes: z.union([z.number(), z.string()]).nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "update-lesson-log-row-from-edited-calendar-event",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const eventId = String(input.id).trim();
    const values = {
      [DATE_COLUMN]: (input.start?.dateTime ?? "").slice(0, 10),
      [DURATION_COLUMN]: String(input.duration_minutes ?? ""),
      [SUMMARY_COLUMN]: input.summary ?? "",
      [NOTES_COLUMN]: input.description ?? "",
    };

    const lookup = await ctx.step("find-lesson-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "lookup_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          lookup_key: EVENT_ID_COLUMN,
          lookup_value: eventId,
        },
      }),
    );

    const row = lookup.data?.[0] as { id?: number | string } | undefined;

    if (row?.id) {
      const update = await ctx.step("update-lesson-row", async () =>
        sdk.runAction({
          appKey: "google-sheets",
          actionType: "write",
          actionKey: "update_row",
          connection: "google-sheets",
          inputs: {
            spreadsheet: SPREADSHEET_ID,
            worksheet: WORKSHEET_ID,
            row: String(row.id),
            [EVENT_ID_COLUMN]: eventId,
            ...values,
          },
        }),
      );

      return {
        eventId,
        action: "updated",
        row: row.id,
        result: update.data?.[0] ?? null,
      };
    }

    const created = await ctx.step("add-lesson-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          [EVENT_ID_COLUMN]: eventId,
          ...values,
        },
      }),
    );

    return { eventId, action: "created", result: created.data?.[0] ?? null };
  },
);

export default workflow;
