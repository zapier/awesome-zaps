import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SLACK_CHANNEL,
  BOT_USERNAME,
  BOT_ICON,
  TITLE_FIELD,
  STATUS_FIELD,
  DATE_FIELD,
  AUDIENCE_FIELD,
  URL_FIELD,
} from "@/config";
import slack from "@/connections/slack";

const sdk = createZapierSdk();

// Notion status values that count as ready to announce.
const READY_STATUSES = ["Planned", "Ready"];
// Set to true only if announcements should be allowed to @-mention people or channels.
const ALLOW_MENTIONS = false;

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
        connection: slack,
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
