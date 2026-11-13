import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { SLACK_CHANNEL, BOT_NAME, BOT_ICON, MENTION_TEXT } from "./config.ts";

const sdk = createZapierSdk();

// Set to true to mention a Slack user group or channel on every alert.
const MENTION_ENABLED = false;
// Longest caption included in the alert, in characters; longer captions are cut.
const MAX_CAPTION_LENGTH = 280;

const InputSchema = z
  .object({
    username: z.string().nullable().optional(),
    caption: z.string().nullable().optional(),
    permalink: z.string().nullable().optional(),
    media_url: z.string().nullable().optional(),
    media_type: z.string().nullable().optional(),
    thumbnail_url: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "notify-team-of-new-tagged-instagram-post-immediately-to-channel",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const author = input.username ? `@${input.username}` : "an unknown account";
    const caption = input.caption ?? "";
    const shortCaption =
      caption.length > MAX_CAPTION_LENGTH
        ? `${caption.slice(0, MAX_CAPTION_LENGTH)}…`
        : caption;
    const mention = MENTION_ENABLED ? MENTION_TEXT : "";
    const text = [
      `${mention}New post tagging ${author}`,
      shortCaption,
      input.permalink ?? "",
    ]
      .filter(Boolean)
      .join("\n");

    const isVideo = input.media_type === "VIDEO";
    const preview =
      (isVideo
        ? (input.thumbnail_url ?? input.media_url)
        : (input.media_url ?? input.thumbnail_url)) ?? "";

    const posted = await ctx.step("send-slack-channel-message", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL,
          text,
          username: BOT_NAME,
          icon: BOT_ICON,
          image_url: preview || undefined,
          link_names: MENTION_ENABLED ? "yes" : "no",
        },
      }),
    );

    return {
      permalink: input.permalink ?? null,
      posted: posted.data?.[0] ?? null,
    };
  },
);

export default workflow;
