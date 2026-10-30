import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Title of the onboarding meeting, exactly as it appears in Outlook.
const ONBOARDING_EVENT_TITLE = "YOUR_ONBOARDING_EVENT_TITLE";
// Start of the window to search for that meeting (ISO 8601 with offset).
const ONBOARDING_WINDOW_START = "YOUR_WINDOW_START_DATETIME";
// End of the window to search for that meeting (ISO 8601 with offset).
const ONBOARDING_WINDOW_END = "YOUR_WINDOW_END_DATETIME";
// Outlook calendar ID to search. Leave empty for the connected account's default calendar.
const CALENDAR_ID = "";

const InputSchema = z
  .object({
    email: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
  })
  .loose();

type OutlookEvent = { id?: string; subject?: string; attendees?: unknown };

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

const workflow = defineDurable<unknown, unknown>(
  "add-new-member-to-onboarding-meeting-attendees-instantly",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));
    const email = (input.email ?? "").trim();
    if (!email) {
      return { skipped: true, reason: "no-email" };
    }

    const search = await ctx.step("find-onboarding-event", async () =>
      sdk.runAction({
        appKey: "microsoft-outlook",
        actionType: "search",
        actionKey: "find_calendar_event",
        connection: "microsoft-outlook",
        inputs: {
          searchTerm: ONBOARDING_EVENT_TITLE,
          startTime: ONBOARDING_WINDOW_START,
          endTime: ONBOARDING_WINDOW_END,
          ...(CALENDAR_ID ? { calendarId: CALENDAR_ID } : {}),
        },
      }),
    );

    // The search matches substrings, so keep only events whose subject is exactly the title.
    const event = (search.data as OutlookEvent[]).find(
      (item) => item.subject === ONBOARDING_EVENT_TITLE,
    );
    if (!event?.id) {
      return { skipped: true, reason: "event-not-found", email };
    }

    // Attendee shape is checked by matching the address anywhere in the serialized list.
    const alreadyAttendee = JSON.stringify(event.attendees ?? []).toLowerCase();
    if (alreadyAttendee.includes(email.toLowerCase())) {
      return { skipped: true, reason: "already-attendee", email };
    }

    const added = await ctx.step("add-attendee-to-event", async () =>
      sdk.runAction({
        appKey: "microsoft-outlook",
        actionType: "write",
        actionKey: "add_attendees",
        connection: "microsoft-outlook",
        inputs: {
          eventId: event.id,
          shouldMergeAttendees: true,
          attendees: [email],
        },
      }),
    );

    return {
      added: true,
      eventId: event.id,
      email,
      name: input.name ?? null,
      updated: added.data?.[0] ?? null,
    };
  },
);

export default workflow;
