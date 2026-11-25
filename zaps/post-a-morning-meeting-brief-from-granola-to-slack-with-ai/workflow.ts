import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  AI_AUTHENTICATION_ID,
  AI_MODEL_ID,
  BOT_NAME,
  BRIEF_INSTRUCTIONS,
  GRANOLA_API_KEY,
  HOURS_AHEAD,
  LOOKBACK_DAYS,
  MAX_GUESTS,
  MAX_NOTE_CHARS,
  MY_EMAIL,
  NOTES_PER_MEETING,
  SKIP_WORDS,
  SLACK_CHANNEL,
} from "./config.ts";

const sdk = createZapierSdk();

const GRANOLA = "https://public-api.granola.ai/v1";
const GCAL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

// The daily schedule trigger sends nothing the zap reads; the schema only checks that the input parses.
const InputSchema = z.object({}).loose();

const EventSchema = z
  .object({
    id: z.string(),
    status: z.string().optional(),
    eventType: z.string().optional(),
    summary: z.string().optional(),
    start: z.object({ dateTime: z.string().optional() }).loose().optional(),
    attendees: z
      .array(
        z
          .object({
            email: z.string().optional(),
            displayName: z.string().optional(),
            self: z.boolean().optional(),
            resource: z.boolean().optional(),
            responseStatus: z.string().optional(),
          })
          .loose(),
      )
      .default([]),
  })
  .loose();

const EventsSchema = z
  .object({ items: z.array(EventSchema).default([]) })
  .loose();

const SearchSchema = z
  .object({
    notes: z
      .array(z.object({ id: z.string(), meeting_at: z.string() }).loose())
      .default([]),
  })
  .loose();

const NoteSchema = z
  .object({
    id: z.string(),
    title: z.string().nullable().optional(),
    summary_markdown: z.string().nullable().optional(),
    summary_text: z.string().nullable().optional(),
    private_notes_markdown: z.string().nullable().optional(),
  })
  .loose();

// Zapier's Granola connection doesn't work with the public API, so the key goes in the header and no connection is passed.
async function granolaJson(path: string, body?: unknown): Promise<unknown> {
  const response = await sdk.fetch(`${GRANOLA}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${GRANOLA_API_KEY}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    throw new Error(
      `Granola returned ${response.status} for ${path}: ${await response.text()}`,
    );
  }
  return response.json();
}

// Google returns each start in the calendar's own timezone, so the clock time can be read straight off the string.
function clockTime(dateTime: string): string {
  const match = dateTime.match(/T(\d{2}):(\d{2})/);
  if (!match) return "";
  const hour = Number(match[1]);
  return `${hour % 12 || 12}:${match[2]} ${hour < 12 ? "AM" : "PM"}`;
}

const workflow = defineDurable(
  "post-a-morning-meeting-brief-from-granola-to-slack-with-ai",
  async (ctx, rawInput) => {
    InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : (rawInput ?? {}),
    );

    const meetings = await ctx.step("list-todays-meetings", async () => {
      const now = Date.now();
      const query = new URLSearchParams({
        timeMin: new Date(now).toISOString(),
        timeMax: new Date(now + HOURS_AHEAD * 3_600_000).toISOString(),
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "50",
      });
      const response = await sdk.fetch(`${GCAL}?${query}`, {
        connection: "google-calendar",
      });
      if (!response.ok) {
        throw new Error(`Google Calendar returned ${response.status}`);
      }
      const { items } = EventsSchema.parse(await response.json());
      const me = MY_EMAIL.toLowerCase();
      return items.flatMap((event) => {
        const title = event.summary?.trim() || "Untitled meeting";
        const lower = title.toLowerCase();
        if (event.status === "cancelled" || !event.start?.dateTime) return [];
        if (event.eventType && event.eventType !== "default") return [];
        if (SKIP_WORDS.some((w) => lower.includes(w.toLowerCase()))) return [];
        const mine = event.attendees.find(
          (a) => a.self || a.email?.toLowerCase() === me,
        );
        if (mine?.responseStatus === "declined") return [];
        const guests = event.attendees.filter(
          (a) =>
            a.email && !a.self && !a.resource && a.email.toLowerCase() !== me,
        );
        if (guests.length === 0 || guests.length > MAX_GUESTS) return [];
        return [
          {
            id: event.id,
            title,
            time: clockTime(event.start.dateTime),
            guests: guests.map((g) => ({
              email: g.email!,
              name: g.displayName ?? g.email!,
            })),
          },
        ];
      });
    });

    if (meetings.length === 0) {
      return { skipped: true, reason: "no-meetings-with-guests" };
    }

    const briefs = [];
    const notBriefed = [];
    for (const meeting of meetings) {
      // Granola matches a participant against the calendar invite, so each guest's email finds the meetings they were in.
      const pastNotes = await ctx.step(
        `find-past-notes-${meeting.id}`,
        async () => {
          const fromDate = new Date(
            Date.now() - LOOKBACK_DAYS * 86_400_000,
          ).toISOString();
          const found = new Map<string, string>();
          for (const guest of meeting.guests) {
            const { notes } = SearchSchema.parse(
              await granolaJson("/notes/search", {
                participant: guest.email,
                from_date: fromDate,
                page_size: 10,
              }),
            );
            for (const note of notes) found.set(note.id, note.meeting_at);
          }
          const recent = [...found.entries()]
            .sort((a, b) => b[1].localeCompare(a[1]))
            .slice(0, NOTES_PER_MEETING);
          const read = [];
          for (const [id, meetingAt] of recent) {
            const note = NoteSchema.parse(await granolaJson(`/notes/${id}`));
            read.push({
              date: meetingAt.slice(0, 10),
              title: note.title || "Untitled meeting",
              summary: (note.summary_markdown ?? note.summary_text ?? "").slice(
                0,
                MAX_NOTE_CHARS,
              ),
              myNotes: (note.private_notes_markdown ?? "").slice(
                0,
                MAX_NOTE_CHARS,
              ),
            });
          }
          return read;
        },
      );

      if (pastNotes.length === 0) {
        notBriefed.push(meeting);
        continue;
      }

      const brief = await ctx.step(`write-brief-${meeting.id}`, async () => {
        const result = await sdk.runAction({
          appKey: "ai",
          actionType: "write",
          actionKey: "get_completion",
          inputs: {
            model_id: AI_MODEL_ID,
            authentication_id: AI_AUTHENTICATION_ID,
            instructions: BRIEF_INSTRUCTIONS,
            inputFields: {
              title: meeting.title,
              guests: meeting.guests.map((g) => g.name).join(", "),
              past_meetings: pastNotes
                .map(
                  (n) =>
                    `## ${n.date}: ${n.title}\n${n.summary}${n.myNotes ? `\n\nMy notes:\n${n.myNotes}` : ""}`,
                )
                .join("\n\n"),
            },
            includeWorkflowData: false,
            outputFields: [
              {
                name: "brief",
                description: "The meeting brief, Slack formatted.",
                type: "text",
                isRequired: true,
              },
            ],
          },
        });
        const output = result.data[0] as { brief?: string } | undefined;
        return (output?.brief ?? "").trim();
      });

      if (brief) {
        briefs.push(`*${meeting.time} · ${meeting.title}*\n${brief}`);
      } else {
        notBriefed.push(meeting);
      }
    }

    if (briefs.length === 0) {
      return {
        skipped: true,
        reason: "nothing-to-brief",
        meetings: meetings.length,
      };
    }

    const others = notBriefed.length
      ? `_Nothing from past meetings for ${notBriefed.map((m) => `${m.title} (${m.time})`).join(", ")}._`
      : "";
    const text = [...briefs, others].filter(Boolean).join("\n\n");

    // A member ID (U… or W…) gets the brief as a DM; anything else is a channel.
    const toPerson = /^[UW][A-Z0-9]+$/.test(SLACK_CHANNEL);
    const message = await ctx.step("post-brief", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: toPerson ? "direct_message" : "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL,
          text,
          as_bot: "yes",
          username: BOT_NAME,
          unfurl: "no",
          add_edit_link: "no",
        },
      }),
    );

    return {
      meetings: meetings.length,
      briefed: briefs.length,
      not_briefed: notBriefed.length,
      message: message.data[0] ?? null,
    };
  },
);

export default workflow;
