import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Notion data source ID of the release tracker database the trigger watches.
const NOTION_DATA_SOURCE_ID = "YOUR_NOTION_DATA_SOURCE_ID";
// Slack channel ID that receives the announcements.
const SLACK_CHANNEL = "YOUR_SLACK_CHANNEL_ID";
// Display name and icon for the posting bot.
const BOT_USERNAME = "Release Bot";
const BOT_ICON = ":rocket:";
// Notion status values that count as ready to announce.
const READY_STATUSES = ["Planned", "Ready"];
// Set to true only if announcements should be allowed to @-mention people or channels.
const ALLOW_MENTIONS = false;
// Notion property names read from each release item.
const TITLE_FIELD = "Name";
const STATUS_FIELD = "Status";
const DATE_FIELD = "Release Date";
const AUDIENCE_FIELD = "Audience";
const URL_FIELD = "URL";

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

// Notion values can be plain strings or rich-text arrays; flatten to text.
function text(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((part) =>
        part && typeof part === "object" && "plain_text" in part
          ? String(part.plain_text)
          : "",
      )
      .join("")
      .trim();
  }
  return "";
}

const workflow = defineDurable<unknown, unknown>(
  "publish-planned-feature-releases-to-gtm-team-channel",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const itemId = text(input.id);
    if (!itemId) {
      return { skipped: true, reason: "missing-item-id" };
    }

    const record = input as Record<string, unknown>;
    const status = text(record[STATUS_FIELD]);
    if (!READY_STATUSES.includes(status)) {
      return { skipped: true, reason: "status-not-ready", itemId, status };
    }

    const title = text(record[TITLE_FIELD]) || "Untitled release";
    const releaseDate = text(record[DATE_FIELD]) || "TBD";
    const audience = text(record[AUDIENCE_FIELD]) || "Not specified";
    const itemUrl = text(record[URL_FIELD]);

    const message = [
      `*${title}*`,
      `Release date: ${releaseDate}`,
      `Audience: ${audience}`,
      `Status: ${status}`,
      itemUrl ? `Details: ${itemUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const post = await ctx.step("post-release-announcement", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL,
          text: message,
          as_bot: "yes",
          username: BOT_USERNAME,
          icon: BOT_ICON,
          link_names: ALLOW_MENTIONS ? "yes" : "no",
        },
      }),
    );

    return { itemId, title, posted: post.data?.[0] ?? null };
  },
);

export default workflow;
