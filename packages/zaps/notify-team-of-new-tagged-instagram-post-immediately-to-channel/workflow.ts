import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Slack channel ID to post alerts into (for example C0123456).
const SLACK_CHANNEL = "YOUR_SLACK_CHANNEL_ID";
// Bot name shown above each alert.
const BOT_NAME = "Instagram Tags";
// Bot icon: an emoji such as ":camera:" or an image URL.
const BOT_ICON = ":camera:";
// Set to true to mention a Slack user group or channel on every alert.
const MENTION_ENABLED = false;
// Mention markup prepended to the alert when MENTION_ENABLED is true.
const MENTION_TEXT = "<!subteam^YOUR_GROUP_ID> ";
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

const workflow = defineDurable<unknown, unknown>(
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
