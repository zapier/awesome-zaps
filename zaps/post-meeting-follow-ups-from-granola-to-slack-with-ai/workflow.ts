import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  AI_AUTHENTICATION_ID,
  AI_MODEL_ID,
  BOT_NAME,
  FOLLOW_UP_INSTRUCTIONS,
  GRANOLA_API_KEY,
  LOOKBACK_HOURS,
  MAX_TRANSCRIPT_CHARS,
  MY_EMAIL,
  SLACK_CHANNEL,
  WINDOW_MINUTES,
} from "./config.ts";

const sdk = createZapierSdk();

const GRANOLA = "https://public-api.granola.ai/v1";
// Granola returns at most 30 notes a page; a busier hour than this is cut, never looped forever.
const MAX_PAGES = 5;

// The hourly schedule trigger sends nothing the zap reads; the schema only checks that the input parses.
const InputSchema = z.object({}).loose();

const ListSchema = z
  .object({
    notes: z
      .array(z.object({ id: z.string(), created_at: z.string() }).loose())
      .default([]),
    hasMore: z.boolean().default(false),
    cursor: z.string().nullable().optional(),
  })
  .loose();

const PersonSchema = z
  .object({ name: z.string().nullable().optional(), email: z.string() })
  .loose();

const TranscriptItemSchema = z
  .object({
    speaker: z
      .object({
        source: z.string().optional(),
        attribution: z.string().optional(),
        diarization_label: z.string().optional(),
        name: z.string().optional(),
      })
      .loose()
      .optional(),
    text: z.string().default(""),
  })
  .loose();

const NoteSchema = z
  .object({
    id: z.string(),
    title: z.string().nullable().optional(),
    owner: PersonSchema,
    web_url: z.string(),
    attendees: z.array(PersonSchema).default([]),
    calendar_event: z
      .object({
        invitees: z.array(z.object({ email: z.string() }).loose()).default([]),
      })
      .loose()
      .nullable()
      .optional(),
    summary_markdown: z.string().nullable().optional(),
    summary_text: z.string().nullable().optional(),
    private_notes_markdown: z.string().nullable().optional(),
    transcript: z.array(TranscriptItemSchema).nullable().optional(),
  })
  .loose();

const TranscriptPageSchema = z
  .object({
    transcript: z.array(TranscriptItemSchema).default([]),
    hasMore: z.boolean().default(false),
    cursor: z.string().nullable().optional(),
  })
  .loose();

// Zapier's Granola connection doesn't work with the public API, so the key goes in the header and no connection is passed.
async function granola(path: string): Promise<Response> {
  return sdk.fetch(`${GRANOLA}${path}`, {
    headers: { Authorization: `Bearer ${GRANOLA_API_KEY}` },
  });
}

async function granolaJson(path: string): Promise<unknown> {
  const response = await granola(path);
  if (!response.ok) {
    throw new Error(
      `Granola returned ${response.status} for ${path}: ${await response.text()}`,
    );
  }
  return response.json();
}

// "Me" is the person whose Granola recorded the meeting; phone recordings carry only a diarization label.
function speakerLabel(item: z.infer<typeof TranscriptItemSchema>): string {
  const speaker = item.speaker ?? {};
  if (speaker.attribution === "me") return "Me";
  if (speaker.name) return speaker.name;
  if (speaker.attribution === "them") return "Them";
  if (speaker.diarization_label) return speaker.diarization_label;
  return speaker.source === "microphone" ? "Me" : "Them";
}

function transcriptText(items: z.infer<typeof TranscriptItemSchema>[]): string {
  return items
    .map((item) => `${speakerLabel(item)}: ${item.text}`)
    .join("\n")
    .slice(0, MAX_TRANSCRIPT_CHARS);
}

async function readNote(id: string) {
  const response = await granola(`/notes/${id}?include=transcript`);
  if (response.ok) {
    const note = NoteSchema.parse(await response.json());
    return { note, transcript: transcriptText(note.transcript ?? []) };
  }
  // Granola refuses to inline a long transcript; read the note without it, then the transcript in pages.
  if (response.status !== 413) {
    throw new Error(
      `Granola returned ${response.status} for note ${id}: ${await response.text()}`,
    );
  }
  const note = NoteSchema.parse(await granolaJson(`/notes/${id}`));
  const items: z.infer<typeof TranscriptItemSchema>[] = [];
  let cursor: string | null | undefined;
  let chars = 0;
  do {
    const page = TranscriptPageSchema.parse(
      await granolaJson(
        `/notes/${id}/transcript?page_size=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
      ),
    );
    items.push(...page.transcript);
    chars += page.transcript.reduce((sum, item) => sum + item.text.length, 0);
    cursor = page.hasMore ? page.cursor : null;
  } while (cursor && chars < MAX_TRANSCRIPT_CHARS);
  return { note, transcript: transcriptText(items) };
}

const quote = (text: string) =>
  text
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");

const workflow = defineDurable(
  "post-meeting-follow-ups-from-granola-to-slack-with-ai",
  async (ctx, rawInput) => {
    InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const window = await ctx.step("set-window", async () => {
      const now = Date.now();
      return {
        updatedAfter: new Date(now - WINDOW_MINUTES * 60_000).toISOString(),
        createdAfter: new Date(now - LOOKBACK_HOURS * 3_600_000).toISOString(),
      };
    });

    // A note reaches the API once Granola has summarized it, which updates it, so "updated this hour" catches new
    // notes. The created_after filter drops older notes that were only edited.
    const noteIds = await ctx.step("list-new-notes", async () => {
      const ids: string[] = [];
      let cursor: string | null | undefined;
      let pages = 0;
      do {
        const page = ListSchema.parse(
          await granolaJson(
            `/notes?updated_after=${encodeURIComponent(window.updatedAfter)}&created_after=${encodeURIComponent(window.createdAfter)}&page_size=30${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
          ),
        );
        ids.push(...page.notes.map((n) => n.id));
        cursor = page.hasMore ? page.cursor : null;
        pages += 1;
      } while (cursor && pages < MAX_PAGES);
      return ids;
    });

    if (noteIds.length === 0) {
      return { skipped: true, reason: "no-new-notes" };
    }

    const posted = [];
    for (const id of noteIds) {
      const meeting = await ctx.step(`read-note-${id}`, async () => {
        const { note, transcript } = await readNote(id);
        // Granola can leave attendees empty; the calendar invite still has the guests.
        const people = note.attendees.length
          ? note.attendees
          : (note.calendar_event?.invitees ?? []);
        return {
          mine: note.owner.email.toLowerCase() === MY_EMAIL.toLowerCase(),
          title: note.title || "Untitled meeting",
          link: note.web_url,
          owner: note.owner.name ?? note.owner.email,
          attendees: people
            .filter((p) => p.email.toLowerCase() !== MY_EMAIL.toLowerCase())
            .map((p) =>
              "name" in p && p.name ? `${p.name} <${p.email}>` : p.email,
            ),
          summary: note.summary_markdown ?? note.summary_text ?? "",
          myNotes: note.private_notes_markdown ?? "",
          transcript,
        };
      });

      if (!meeting.mine) continue;

      const written = await ctx.step(`write-follow-up-${id}`, async () => {
        const result = await sdk.runAction({
          appKey: "ai",
          actionType: "write",
          actionKey: "get_completion",
          inputs: {
            model_id: AI_MODEL_ID,
            authentication_id: AI_AUTHENTICATION_ID,
            instructions: FOLLOW_UP_INSTRUCTIONS,
            inputFields: {
              user: meeting.owner,
              title: meeting.title,
              attendees:
                meeting.attendees.join(", ") ||
                "(not listed; take names from the transcript)",
              summary: meeting.summary,
              my_notes: meeting.myNotes,
              transcript: meeting.transcript,
            },
            includeWorkflowData: false,
            outputFields: [
              {
                name: "recap",
                description: "Decisions and action items, Slack formatted.",
                type: "text",
                isRequired: true,
              },
              {
                name: "follow_up",
                description:
                  "The follow-up email, or an empty string when none is needed.",
                type: "text",
                isRequired: false,
              },
            ],
          },
        });
        const output = result.data[0] as
          { recap?: string; follow_up?: string } | undefined;
        return {
          recap: (output?.recap ?? "").trim(),
          followUp: (output?.follow_up ?? "").trim(),
        };
      });

      if (!written.recap && !written.followUp) continue;

      const text = [
        `*<${meeting.link}|${meeting.title}>*`,
        written.recap,
        written.followUp ? `*Draft follow-up*\n${quote(written.followUp)}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      // A member ID (U… or W…) gets the follow-up as a DM; anything else is a channel.
      const toPerson = /^[UW][A-Z0-9]+$/.test(SLACK_CHANNEL);
      const message = await ctx.step(`post-follow-up-${id}`, async () =>
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
      posted.push({
        id,
        title: meeting.title,
        message: message.data[0] ?? null,
      });
    }

    return { notes: noteIds.length, posted: posted.length, follow_ups: posted };
  },
);

export default workflow;
