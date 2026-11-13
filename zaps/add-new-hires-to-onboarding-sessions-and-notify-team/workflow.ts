import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  ONBOARDING_CHANNEL_ID,
  PROVISIONING_REMINDER,
  ONBOARDING_CALENDAR_ID,
  DEFAULT_SESSION_SEARCH_TERM,
} from "./config.ts";

const sdk = createZapierSdk();

// How long to wait for BambooHR to have the hire's record before touching calendars (24 hours).
const HR_PROPAGATION_DELAY_SECONDS = 24 * 60 * 60;
// BambooHR location value mapped to the search term for that location's onboarding sessions. Empty means every location uses DEFAULT_SESSION_SEARCH_TERM.
const LOCATION_SESSION_SEARCH_TERMS: Record<string, string> = {};
// How many days after the hire date to look for onboarding sessions.
const SESSION_WINDOW_DAYS = 30;

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    primaryEmail: z.string().nullable().optional(),
    name: z
      .object({
        fullName: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

type BambooEmployee = {
  id?: string;
  hireDate?: string;
  location?: string;
};

type CalendarEvent = {
  id?: string;
  summary?: string;
  attendee_emails?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const workflow = defineDurable(
  "add-new-hires-to-onboarding-sessions-and-notify-team",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const email = (input.primaryEmail ?? "").trim();
    if (!email) {
      return { skipped: true, reason: "no-account-email" };
    }
    const fullName = input.name?.fullName ?? email;

    await ctx.step("notify-onboarding-channel", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: ONBOARDING_CHANNEL_ID,
          text: `New Google Workspace account: ${fullName} (${email}).\n${PROVISIONING_REMINDER}`,
          as_bot: "yes",
          link_names: "no",
          unfurl: "no",
          add_edit_link: "no",
        },
      }),
    );

    await ctx.wait("wait-for-hr-record", HR_PROPAGATION_DELAY_SECONDS);

    const search = await ctx.step("find-bamboohr-employee", async () =>
      sdk.runAction({
        appKey: "bamboohr",
        actionType: "search",
        actionKey: "employeeSearch",
        connection: "bamboohr",
        inputs: {
          search_by: "email",
          search_term: email,
        },
      }),
    );

    const employee = search.data?.[0] as BambooEmployee | undefined;
    if (!employee?.id) {
      return { skipped: true, reason: "employee-not-found", email };
    }

    const location = (employee.location ?? "").trim();
    const searchTerm =
      LOCATION_SESSION_SEARCH_TERMS[location] ?? DEFAULT_SESSION_SEARCH_TERM;

    // Date math is journaled in a step: the durable runtime rejects `new Date()` in workflow scope.
    const window = await ctx.step("compute-session-window", async () => {
      const parsed = employee.hireDate ? Date.parse(employee.hireDate) : NaN;
      const fromMs = Number.isNaN(parsed) ? Date.now() : parsed;
      return {
        from: new Date(fromMs).toISOString(),
        to: new Date(fromMs + SESSION_WINDOW_DAYS * DAY_MS).toISOString(),
      };
    });

    const found = await ctx.step("find-onboarding-sessions", async () =>
      sdk.runAction({
        appKey: "google-calendar",
        actionType: "search",
        actionKey: "event_v2",
        connection: "google-calendar",
        inputs: {
          calendarid: ONBOARDING_CALENDAR_ID,
          search_term: searchTerm,
          end_time: window.from,
          start_time: window.to,
          expand_recurring: "true",
          ordering: "startTime",
        },
      }),
    );

    const sessions = (found.data as CalendarEvent[]).filter(
      (event) =>
        event.id &&
        !(event.attendee_emails ?? "")
          .toLowerCase()
          .includes(email.toLowerCase()),
    );
    if (sessions.length === 0) {
      return { skipped: true, reason: "no-open-sessions", email, searchTerm };
    }

    const results = [];
    for (const session of sessions) {
      const result = await ctx.step(
        `add-hire-to-session-${session.id}`,
        async () => {
          try {
            await sdk.runAction({
              appKey: "google-calendar",
              actionType: "write",
              actionKey: "add_attendees",
              connection: "google-calendar",
              inputs: {
                calendarid: ONBOARDING_CALENDAR_ID,
                eventid: session.id,
                attendees: email,
              },
            });
            return { eventId: session.id, added: true };
          } catch (error) {
            return {
              eventId: session.id,
              added: false,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
      );
      results.push(result);
    }

    return {
      email,
      employeeId: employee.id,
      location: location || null,
      searchTerm,
      added: results.filter((r) => r.added).length,
      failed: results.filter((r) => !r.added).length,
      results,
    };
  },
);

export default workflow;
