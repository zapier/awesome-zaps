import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Catch-hook URL of the reusable routing workflow that updates the contact group.
const ROUTING_WEBHOOK_URL = "YOUR_ROUTING_WEBHOOK_URL";
// Canonical rotation identifiers the routing workflow knows (after normalization).
const KNOWN_ROTATIONS = ["platform-primary", "platform-secondary"];
// Rotation identifier sent when the event summary matches no known rotation.
const FALLBACK_ROTATION = "default";
// Default contact set: sent as the group members input and as the fallback.
const DEFAULT_CONTACTS = ["YOUR_DEFAULT_CONTACT_EMAIL"];

const PersonSchema = z
  .object({ email: z.string().nullable().optional() })
  .loose();

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    htmlLink: z.string().nullable().optional(),
    start: z
      .object({
        dateTime: z.string().nullable().optional(),
        date: z.string().nullable().optional(),
        timeZone: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
    attendees: z.array(PersonSchema).nullable().optional(),
    attendee_emails: z.unknown(),
  })
  .loose();

// Lowercase, drop [tags], (notes), "week N" and on-call filler words, then kebab-case.
function normalizeRotation(summary: string): string {
  return summary
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\bweek\s*\d+\b/g, " ")
    .replace(/\b(on[\s-]?call|rotation|shift|handoff)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function attendeeEmails(input: z.infer<typeof InputSchema>): string[] {
  const fromList = (input.attendees ?? [])
    .map((a) => a.email ?? "")
    .filter(Boolean);
  if (fromList.length) return fromList;
  const raw = input.attendee_emails;
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(",")
      : [];
  return list.map((e) => String(e).trim()).filter(Boolean);
}

const workflow = defineDurable<unknown, unknown>(
  "update-on-call-contact-group-when-rotation-event-starts",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const summary = input.summary ?? "";
    const normalized = normalizeRotation(summary);
    const matched = KNOWN_ROTATIONS.includes(normalized);
    const rotation = matched ? normalized : FALLBACK_ROTATION;
    const effectiveAt = input.start?.dateTime ?? input.start?.date ?? null;
    const attendees = attendeeEmails(input);

    const payload = {
      rotation_id: rotation,
      rotation_matched: matched,
      raw_summary: summary,
      effective_at: effectiveAt,
      group_members: DEFAULT_CONTACTS,
      fallback_contacts: DEFAULT_CONTACTS,
      attendees,
      event_id: input.id ?? null,
      event_link: input.htmlLink ?? null,
    };

    const routing = await ctx.step("call-routing-workflow", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "custom",
        inputs: {
          url: ROUTING_WEBHOOK_URL,
          method: "POST",
          data: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          unflatten: "no",
        },
      }),
    );

    const response = routing.data?.[0] as Record<string, unknown> | undefined;
    return {
      rotation,
      matched,
      effectiveAt,
      attendees: attendees.length,
      routingResponse: response
        ? JSON.stringify(response.json ?? response).slice(0, 1000)
        : null,
    };
  },
);

export default workflow;
