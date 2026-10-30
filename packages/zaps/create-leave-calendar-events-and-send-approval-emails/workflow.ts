import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table of leave requests. Its "Trigger Zap Button Clicked" trigger fires from here.
const LEAVE_REQUESTS_TABLE_ID = "YOUR_LEAVE_REQUESTS_TABLE_ID";
// Zapier Tables table of allowances, one row per requester: data__f1 email, data__f2 name, data__f3 allowance_remaining.
const LEAVE_TRACKER_TABLE_ID = "YOUR_LEAVE_TRACKER_TABLE_ID";
// Google Calendar the approved leave events are created on.
const CALENDAR_ID = "YOUR_CALENDAR_ID";
// Text added to the approval email telling the requester how to change the leave.
const EDIT_INSTRUCTIONS =
  "To change or cancel this leave, edit the calendar event or reply to this email.";

const DAY_MS = 24 * 60 * 60 * 1000;

const InputSchema = z
  .object({
    record_id: z.string().nullable().optional(),
    new: z
      .object({
        data: z
          .object({
            f1: z.string().nullable().optional(), // requester_name
            f2: z.string().nullable().optional(), // requester_email
            f3: z.string().nullable().optional(), // leave_type
            f4: z.string().nullable().optional(), // start_date
            f5: z.string().nullable().optional(), // end_date
            f6: z.string().nullable().optional(), // start_time
            f7: z.string().nullable().optional(), // end_time
            f8: z.boolean().nullable().optional(), // full_day
          })
          .loose(),
      })
      .loose(),
  })
  .loose();

function dateOnly(value: string): string {
  return value.slice(0, 10);
}

function addDays(date: string, days: number): string {
  return new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10);
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

const workflow = defineDurable<unknown, unknown>(
  "create-leave-calendar-events-and-send-approval-emails",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const data = input.new.data;

    const requesterEmail = data.f2;
    const requesterName = data.f1 ?? "Team member";
    const leaveType = data.f3 ?? "Leave";
    const fullDay = data.f8 === true;
    if (!requesterEmail || !data.f4 || !data.f5) {
      return { skipped: true, reason: "missing-request-fields" };
    }
    if (!fullDay && (!data.f6 || !data.f7)) {
      return { skipped: true, reason: "partial-request-missing-times" };
    }

    const startDate = dateOnly(data.f4);
    const endDate = dateOnly(data.f5);
    const startTime = data.f6 ?? "";
    const endTime = data.f7 ?? "";

    // All-day events end on the day after the last leave day, so the end date is exclusive.
    const eventStart = fullDay ? startDate : `${startDate}T${startTime}:00`;
    const eventEnd = fullDay ? addDays(endDate, 1) : `${endDate}T${endTime}:00`;
    const when = fullDay
      ? startDate === endDate
        ? startDate
        : `${startDate} to ${endDate}`
      : `${startDate} ${startTime}-${endTime}`;

    const event = await ctx.step("create-calendar-event", async () =>
      sdk.runAction({
        appKey: "google-calendar",
        actionType: "write",
        actionKey: "detailed_event",
        connection: "google-calendar",
        inputs: {
          calendarid: CALENDAR_ID,
          summary: `${requesterName} - ${leaveType}`,
          description: `Approved ${leaveType.toLowerCase()} for ${requesterName} (${when}).`,
          attendees: [requesterEmail],
          all_day: fullDay ? "yes" : "no",
          start__dateTime: eventStart,
          end__dateTime: eventEnd,
        },
      }),
    );
    const calendarLink =
      (event.data[0] as { htmlLink?: string } | undefined)?.htmlLink ?? "";

    await ctx.step("send-approval-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: [requesterEmail],
          subject: `Leave approved: ${leaveType}, ${when}`,
          body: `Hi ${requesterName},\n\nYour ${leaveType.toLowerCase()} request for ${when} is approved.\n\nCalendar event: ${calendarLink}\n\n${EDIT_INSTRUCTIONS}`,
          body_type: "plain",
        },
      }),
    );

    // Full-day requests use inclusive day counts (a single day is 1); partial requests use hours.
    const amount = fullDay
      ? Math.round((Date.parse(endDate) - Date.parse(startDate)) / DAY_MS) + 1
      : (toMinutes(endTime) - toMinutes(startTime)) / 60;

    const match = await ctx.step("find-leave-tracker-row", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        connection: "zapier-tables",
        inputs: {
          table_id: LEAVE_TRACKER_TABLE_ID,
          filter_count: "1",
          field_data_key: "data__f1",
          operator: "exact",
          lookup_value: requesterEmail,
          use_stored_order: "false",
        },
      }),
    );

    let recordId = (match.data[0] as { record_id?: string } | undefined)
      ?.record_id;
    if (!recordId) {
      const created = await ctx.step("create-leave-tracker-row", async () =>
        sdk.runAction({
          appKey: "zapier-tables",
          actionType: "write",
          actionKey: "create_record",
          connection: "zapier-tables",
          inputs: {
            table_id: LEAVE_TRACKER_TABLE_ID,
            new__data__f1: requesterEmail,
            new__data__f2: requesterName,
            new__data__f3: "0",
          },
        }),
      );
      recordId = (created.data[0] as { record_id?: string } | undefined)
        ?.record_id;
    }
    if (!recordId) {
      throw new Error("Leave tracker row could not be found or created");
    }

    await ctx.step("decrement-leave-allowance", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "increment_value",
        connection: "zapier-tables",
        inputs: {
          table_id: LEAVE_TRACKER_TABLE_ID,
          record_id: recordId,
          field_data_key: "data__f3",
          increment_amount: String(-amount),
        },
      }),
    );

    return {
      requesterEmail,
      recordId,
      decremented: amount,
      unit: fullDay ? "days" : "hours",
      calendarLink,
    };
  },
);

export default workflow;
