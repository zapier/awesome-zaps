import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table ID that holds the new-hire records. Also set this as the table in the trigger.
const TABLE_ID = "YOUR_TABLE_ID";
// Google Calendar ID of the HR calendar that the induction event is created on.
const HR_CALENDAR_ID = "YOUR_HR_CALENDAR_ID";
// HR coordinator address, CC'd on the welcome email to the new hire.
const HR_COORDINATOR_EMAIL = "YOUR_HR_COORDINATOR_EMAIL";
// IT address: receives the internal provisioning email and is invited to the induction event.
const IT_EMAIL = "YOUR_IT_EMAIL";
// License owners address: receives the internal provisioning email.
const LICENSE_OWNERS_EMAIL = "YOUR_LICENSE_OWNERS_EMAIL";
// How many days before the start date the induction event is scheduled.
const INDUCTION_OFFSET_DAYS = 1;
// Length of the induction event, in minutes.
const INDUCTION_LENGTH_MINUTES = 60;

// Field keys on the Zapier Tables record, as they appear in the trigger payload.
const NAME = "f1";
const EMAIL = "f2";
const START_DATE = "f3";
const INDUCTION_LINK = "f4";
const HIRING_MANAGER_EMAIL = "f5";
const INVITED_AT = "f6";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InputSchema = z
  .object({
    record_id: z.string(),
    new: z
      .object({
        data: z
          .object({
            f1: z.string().nullable().optional(),
            f2: z.string().nullable().optional(),
            f3: z.string().nullable().optional(),
            f4: z.string().nullable().optional(),
            f5: z.string().nullable().optional(),
            f6: z.string().nullable().optional(),
          })
          .loose(),
      })
      .loose(),
  })
  .loose();

function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const workflow = defineDurable<unknown, unknown>(
  "create-induction-event-and-welcome-emails-for-new-hires",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const recordId = input.record_id;
    const data = input.new.data;

    const name = (data[NAME] ?? "").trim();
    const email = (data[EMAIL] ?? "").trim();
    const startDate = data[START_DATE] ?? null;
    const inductionLink = data[INDUCTION_LINK] ?? "";
    const hiringManagerEmail = (data[HIRING_MANAGER_EMAIL] ?? "").trim();
    const alreadyInvited = (data[INVITED_AT] ?? "").trim() !== "";

    // Only records with a valid contact email and a start date are processed.
    if (!startDate) {
      return { skipped: true, reason: "no-start-date", recordId };
    }
    if (!EMAIL_PATTERN.test(email)) {
      return { skipped: true, reason: "no-valid-contact-email", recordId };
    }
    // The trigger fires on every record update, so a record is only processed once.
    if (alreadyInvited) {
      return { skipped: true, reason: "already-invited", recordId };
    }

    // Mark the record first so a re-triggered run from this update skips it.
    const invitedAt = await ctx.step("capture-invited-at", async () =>
      new Date().toISOString(),
    );

    await ctx.step("mark-record-invited", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "update_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TABLE_ID,
          record_id: recordId,
          [`new__data__${INVITED_AT}`]: invitedAt,
        },
      }),
    );

    // Date math is journaled in a step: the durable runtime rejects `new Date()` in workflow scope.
    const schedule = await ctx.step("compute-induction-schedule", async () => {
      const startMs = new Date(startDate).getTime();
      const eventStartMs =
        startMs - INDUCTION_OFFSET_DAYS * 24 * 60 * 60 * 1000;
      return {
        displayDate: formatDisplayDate(startDate),
        eventStart: new Date(eventStartMs).toISOString(),
        eventEnd: new Date(
          eventStartMs + INDUCTION_LENGTH_MINUTES * 60 * 1000,
        ).toISOString(),
      };
    });
    const { displayDate, eventStart, eventEnd } = schedule;

    const welcome = await ctx.step("send-welcome-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: email,
          cc: HR_COORDINATOR_EMAIL,
          subject: `Welcome to the team, ${name}`,
          body: `Hi ${name},\n\nWelcome! Your start date is ${displayDate}.\n\nYour induction details: ${inductionLink}\n\nSee you soon.`,
        },
      }),
    );

    const internal = await ctx.step("send-it-and-license-notice", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: `${IT_EMAIL}, ${LICENSE_OWNERS_EMAIL}`,
          subject: `New hire provisioning: ${name} (starts ${displayDate})`,
          body: `New hire: ${name}\nEmail: ${email}\nStart date: ${displayDate}\nHiring manager: ${hiringManagerEmail}\nInduction link: ${inductionLink}\n\nPlease queue provisioning tasks.`,
        },
      }),
    );

    const event = await ctx.step("create-induction-event", async () =>
      sdk.runAction({
        appKey: "google-calendar",
        actionType: "write",
        actionKey: "detailed_event",
        connection: "google-calendar",
        inputs: {
          calendarid: HR_CALENDAR_ID,
          summary: `Induction: ${name}`,
          description: `Induction for ${name}, starting ${displayDate}.\n${inductionLink}`,
          start__dateTime: eventStart,
          end__dateTime: eventEnd,
          attendees: `${hiringManagerEmail}, ${IT_EMAIL}`,
        },
      }),
    );

    return {
      recordId,
      invitedAt,
      welcomeEmailId: welcome.data?.[0]?.id ?? null,
      internalEmailId: internal.data?.[0]?.id ?? null,
      eventId: event.data?.[0]?.id ?? null,
    };
  },
);

export default workflow;
