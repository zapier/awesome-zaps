import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { SLACK_CHANNEL, ALERT_HEADER, MENTION_PREFIX } from "@/config";
import slack from "@/connections/slack";

const sdk = createZapierSdk();

// Words that mark an email as a monitoring alert. Matched case-insensitively in the subject or body.
const ALERT_KEYWORDS = ["alert", "monitoring", "drift", "threshold"];
// Maximum characters of the email body to post.
const BODY_SNIPPET_LENGTH = 400;

const InputSchema = z
  .object({
    subject: z.string().nullable().optional(),
    body_plain: z.string().nullable().optional(),
    message_id: z.string().nullable().optional(),
    message_url: z.string().nullable().optional(),
  })
  .loose();

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

const workflow = defineDurable<unknown, unknown>(
  "post-model-monitoring-emails-to-data-science-channel",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));
    const subject = input.subject ?? "";
    const body = input.body_plain ?? "";

    const haystack = `${subject}\n${body}`.toLowerCase();
    const isAlert = ALERT_KEYWORDS.some((keyword) =>
      haystack.includes(keyword),
    );
    if (!isAlert) {
      return {
        skipped: true,
        reason: "no-alert-keyword",
        messageId: input.message_id ?? null,
      };
    }

    const snippet = body
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, BODY_SNIPPET_LENGTH);
    const linkLine = input.message_url
      ? `\nOriginal email: ${input.message_url}`
      : "";
    const text = `${MENTION_PREFIX}*${ALERT_HEADER}: ${subject}*\n${snippet}${linkLine}`;

    const posted = await ctx.step("post-alert-to-slack", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: slack,
        inputs: {
          channel: SLACK_CHANNEL,
          text,
          link_names: "no",
          add_edit_link: "no",
        },
      }),
    );

    return {
      messageId: input.message_id ?? null,
      posted: posted.data?.[0] ?? null,
    };
  },
);

export default workflow;
