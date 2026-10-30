import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Calendar to watch. Set the same value as the trigger's calendarid when you configure the trigger.
const CALENDAR_ID = "YOUR_CALENDAR_ID";
// Zapier Tables table to log into: the table's ID, from its URL.
const TABLE_ID = "YOUR_TABLE_ID";
// Table field keys, matching the column order: Title, Start, End, Duration (minutes), Attendees, Source ID.
// Source ID is the field the duplicate check looks up.
const SOURCE_ID_FIELD = "f6";

const InputSchema = z
  .object({
    id: z.string(),
    summary: z.string().nullable().optional(),
    start: z
      .object({
        dateTime: z.string().nullable().optional(),
        date: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
    end: z
      .object({
        dateTime: z.string().nullable().optional(),
        date: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
    attendee_emails: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "log-meeting-details-to-analytics-table-from-calendar",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    // The trigger already sends ISO 8601 datetimes, so they are passed through as-is.
    const startIso = input.start?.dateTime ?? input.start?.date ?? "";
    const endIso = input.end?.dateTime ?? input.end?.date ?? "";
    const durationMinutes =
      startIso && endIso
        ? String(
            Math.round((Date.parse(endIso) - Date.parse(startIso)) / 60000),
          )
        : "";
    const attendees = (input.attendee_emails ?? "")
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean)
      .join(", ");
    const title = input.summary ?? "(no title)";

    const existing = await ctx.step("find-existing-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TABLE_ID,
          filter_count: "1",
          field_data_key: SOURCE_ID_FIELD,
          operator: "exact",
          lookup_value: input.id,
        },
      }),
    );

    if (existing.data.length > 0) {
      return {
        skipped: true,
        reason: "event-already-logged",
        eventId: input.id,
      };
    }

    const record = await ctx.step("create-analytics-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "create_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TABLE_ID,
          new__data__f1: title,
          new__data__f2: startIso,
          new__data__f3: endIso,
          new__data__f4: durationMinutes,
          new__data__f5: attendees,
          new__data__f6: input.id,
        },
      }),
    );

    return { eventId: input.id, created: record.data[0] ?? null };
  },
);

export default workflow;
