import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Advisor addresses the meeting notes are sent to (To:).
const ADVISOR_EMAILS = ["YOUR_ADVISOR_EMAIL"];
// Operations coordinators copied on every email (CC:). Leave empty for no CC.
const OPS_CC_EMAILS = ["YOUR_OPS_COORDINATOR_EMAIL"];
// Team mailbox replies should go to (Reply-To:). Leave "" to reply to the sender.
const REPLY_TO_EMAIL = "YOUR_TEAM_MAILBOX";
// Prefix added to every subject, e.g. "Meeting notes: ".
const SUBJECT_PREFIX = "[install-test] Meeting notes: ";

const Participant = z.union([
  z.string(),
  z
    .object({
      name: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
    })
    .loose(),
]);

const InputSchema = z
  .object({
    event_id: z.union([z.string(), z.number()]).nullable().optional(),
    submission_id: z.union([z.string(), z.number()]).nullable().optional(),
    call_title: z.string().nullable().optional(),
    participants: z
      .union([z.array(Participant), z.string()])
      .nullable()
      .optional(),
    topics: z
      .union([z.array(z.string()), z.string()])
      .nullable()
      .optional(),
    meeting_link: z.string().nullable().optional(),
  })
  .loose();

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toList(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  const items = Array.isArray(value) ? value : value.split(/\r?\n|;|,/);
  return items.map((item) => item.trim()).filter(Boolean);
}

const workflow = defineDurable<unknown, unknown>(
  "send-meeting-notes-email-to-advisor-operations-team",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));

    const eventId = String(input.event_id ?? input.submission_id ?? "").trim();
    const title = input.call_title?.trim() || "Client call";
    const ref = eventId ? `Ref ${eventId}` : "";
    const subject = `${SUBJECT_PREFIX}${title}${ref ? ` (${ref})` : ""}`;

    // Dedupe: a webhook retry carries the same event ID, which every sent email
    // records in its subject, so look for it in the mailbox before sending.
    if (ref) {
      const existing = await ctx.step("find-already-sent-notes", async () =>
        sdk.runAction({
          appKey: "microsoft-outlook",
          actionType: "search",
          actionKey: "find_email",
          connection: "microsoft-outlook",
          inputs: { searchValue: eventId },
        }),
      );
      const duplicate = (existing.data ?? []).some((email) =>
        String((email as { subject?: string }).subject ?? "").includes(
          `(${ref})`,
        ),
      );
      if (duplicate) {
        return { skipped: true, reason: "duplicate-event", eventId };
      }
    }

    const participants = (
      typeof input.participants === "string"
        ? toList(input.participants)
        : (input.participants ?? []).map((p) =>
            typeof p === "string" ? p.trim() : (p.name ?? p.email ?? "").trim(),
          )
    ).filter(Boolean);
    const topics = toList(input.topics);
    const link = input.meeting_link?.trim() ?? "";

    const html = [
      `<h2>${escapeHtml(title)}</h2>`,
      `<p><strong>Participants:</strong> ${participants.length ? escapeHtml(participants.join(", ")) : "Not provided"}</p>`,
      `<p><strong>Discussion topics:</strong></p>`,
      topics.length
        ? `<ul>${topics.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`
        : `<p>None recorded.</p>`,
      `<p><strong>Meeting link:</strong> ${link ? `<a href="${escapeHtml(link)}">${escapeHtml(link)}</a>` : "Not provided"}</p>`,
      ref ? `<p style="color:#888;font-size:12px">${escapeHtml(ref)}</p>` : "",
    ].join("\n");

    const sent = await ctx.step("send-meeting-notes-email", async () =>
      sdk.runAction({
        appKey: "microsoft-outlook",
        actionType: "write",
        actionKey: "send_email",
        connection: "microsoft-outlook",
        inputs: {
          recipients: ADVISOR_EMAILS,
          ...(OPS_CC_EMAILS.length ? { ccRecipients: OPS_CC_EMAILS } : {}),
          ...(REPLY_TO_EMAIL ? { replyTo: [REPLY_TO_EMAIL] } : {}),
          subject,
          bodyFormat: "HTML",
          body: html,
        },
      }),
    );

    return {
      eventId: eventId || null,
      subject,
      participants: participants.length,
      topics: topics.length,
      sent: Boolean(sent.data?.[0]),
    };
  },
);

export default workflow;
