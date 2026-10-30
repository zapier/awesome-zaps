import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Calendar ID of the rotation calendar. The trigger watches it and this step updates its events.
const CALENDAR_ID = "YOUR_CALENDAR_ID";
// Rotation names as they appear in event titles, mapped to the on-call contact's email.
const ROSTER: Record<string, string> = {
  YOUR_ROTATION_NAME: "YOUR_CONTACT_EMAIL",
};
// Contact written when no rotation name in the event title matches ROSTER.
const DEFAULT_CONTACT = "YOUR_DEFAULT_CONTACT_EMAIL";
// Label for the line written into the event description, so a re-run replaces it instead of adding another.
const CONTACT_LABEL = "On call:";

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
  })
  .loose();

function resolveContact(summary: string): string {
  const title = summary.toLowerCase();
  const rotation = Object.keys(ROSTER).find((name) => title.includes(name));
  return rotation ? ROSTER[rotation] : DEFAULT_CONTACT;
}

const workflow = defineDurable<unknown, unknown>(
  "assign-on-call-contact-from-next-calendar-event-to-roster",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const contact = resolveContact(input.summary ?? "");
    const kept = (input.description ?? "")
      .split("\n")
      .filter((line) => !line.startsWith(CONTACT_LABEL))
      .join("\n")
      .trim();
    const description = [kept, `${CONTACT_LABEL} ${contact}`]
      .filter(Boolean)
      .join("\n");

    const update = await ctx.step("write-on-call-contact-to-event", async () =>
      sdk.runAction({
        appKey: "google-calendar",
        actionType: "write",
        actionKey: "update_event",
        connection: "google-calendar",
        inputs: {
          calendarid: CALENDAR_ID,
          eventid: input.id,
          description,
          send_notifications: "false",
        },
      }),
    );

    return {
      eventId: input.id,
      shiftStart: input.start?.dateTime ?? null,
      contact,
      updated: update.data?.[0]?.id ?? null,
    };
  },
);

export default workflow;
