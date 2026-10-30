import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Words in the event title that make it a release event. Matching is case-insensitive.
const RELEASE_KEYWORDS = ["release", "launch"];
// Slack user ID to message when no Slack user matches the event organizer's email.
const FALLBACK_SLACK_USER_ID = "YOUR_SLACK_USER_ID";
// Keep false so the message never notifies anyone. Set true only if mentions should ping people.
const SEND_MENTIONS = false;

const TimeSchema = z
  .object({
    dateTime: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
    timeZone: z.string().nullable().optional(),
  })
  .loose()
  .nullable()
  .optional();

const InputSchema = z
  .object({
    summary: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    htmlLink: z.string().nullable().optional(),
    organizer: z
      .object({ email: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
    start: TimeSchema,
    end: TimeSchema,
  })
  .loose();

function formatWhen(
  start: z.infer<typeof TimeSchema>,
  end: z.infer<typeof TimeSchema>,
): string {
  if (!start?.dateTime) {
    return start?.date
      ? `All day, ${new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${start.date}T00:00:00Z`))}`
      : "Time not set";
  }
  const zone = start.timeZone ?? undefined;
  const startDate = new Date(start.dateTime);
  const dateText = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: zone,
  }).format(startDate);
  const timeFormat = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: zone,
    timeZoneName: "short",
  });
  const endTime = end?.dateTime
    ? ` to ${timeFormat.format(new Date(end.dateTime))}`
    : "";
  return `${dateText}, ${timeFormat.format(startDate)}${endTime}`;
}

const workflow = defineDurable<unknown, unknown>(
  "send-release-calendar-alert-to-product-marketing-manager",
  async (ctx, rawInput) => {
    const event = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const title = event.summary ?? "(untitled event)";
    const isRelease = RELEASE_KEYWORDS.some((keyword) =>
      title.toLowerCase().includes(keyword),
    );
    if (!isRelease) {
      return { skipped: true, reason: "no-release-keyword", title };
    }

    const organizerEmail = event.organizer?.email ?? null;
    const owner = organizerEmail
      ? await ctx.step("find-slack-user-by-email", async () =>
          sdk.runAction({
            appKey: "slack",
            actionType: "search",
            actionKey: "user_by_email",
            connection: "slack",
            inputs: { email: organizerEmail },
          }),
        )
      : null;
    const ownerMatch = owner?.data?.[0] as { id?: string } | undefined;
    const recipientId = ownerMatch?.id ?? FALLBACK_SLACK_USER_ID;

    const when = formatWhen(event.start, event.end);
    const description = (event.description ?? "")
      .replace(/<[^>]+>/g, "")
      .trim();
    const body = [description, event.htmlLink ?? ""]
      .filter(Boolean)
      .join("\n\n");
    const text = `*${title}*\n${when}${body ? `\n\n${body}` : ""}`;

    const sent = await ctx.step("send-slack-direct-message", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "direct_message",
        connection: "slack",
        inputs: {
          channel: recipientId,
          text,
          as_bot: "yes",
          link_names: SEND_MENTIONS ? "yes" : "no",
          add_edit_link: "no",
          send_multi: "no",
        },
      }),
    );

    return {
      title,
      recipientId,
      matchedOwner: ownerMatch !== undefined,
      sent: sent.data?.[0] ?? null,
    };
  },
);

export default workflow;
