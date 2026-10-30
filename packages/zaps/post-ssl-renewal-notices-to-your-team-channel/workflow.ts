import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Slack channel ID to post notices into (the long ID shown in the channel's details).
const SLACK_CHANNEL = "YOUR_SLACK_CHANNEL_ID";
// Words in the subject or body that mark a renewal or failure notice. Messages without one are skipped.
const RENEWAL_PATTERN = /\b(renew\w*|expir\w*|fail\w*)\b/i;
// Number of characters of the email body to include as the message preview.
const PREVIEW_LENGTH = 300;

const InputSchema = z
  .object({
    subject: z.string().nullable().optional(),
    body_plain: z.string().nullable().optional(),
    from: z
      .object({
        name: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
    message_url: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "post-ssl-renewal-notices-to-your-team-channel",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const subject = input.subject ?? "";
    const body = input.body_plain ?? "";
    if (!RENEWAL_PATTERN.test(`${subject} ${body}`)) {
      return {
        skipped: true,
        reason: "no-renewal-or-failure-keyword",
        subject,
      };
    }

    const sender = input.from?.name || input.from?.email || "Unknown sender";
    const preview = body.replace(/\s+/g, " ").trim().slice(0, PREVIEW_LENGTH);
    const link = input.message_url
      ? `Original email: ${input.message_url}`
      : null;
    const text = [
      `*${sender}*`,
      `*${subject || "(no subject)"}*`,
      preview || null,
      link,
    ]
      .filter(Boolean)
      .join("\n");

    await ctx.step("post-ssl-notice-to-channel", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL,
          text,
          as_bot: "yes",
          link_names: "no",
          add_edit_link: "no",
          unfurl: "no",
        },
      }),
    );

    return { posted: true, subject };
  },
);

export default workflow;
