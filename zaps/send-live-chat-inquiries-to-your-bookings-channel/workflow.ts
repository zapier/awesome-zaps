import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { BOOKINGS_CHANNEL_ID, BOT_NAME, BOT_ICON } from "./config.ts";

const sdk = createZapierSdk();

// Longest message text included in the alert before it is cut off.
const MESSAGE_PREVIEW_LENGTH = 280;

const InputSchema = z
  .object({
    sender_email: z.string().nullable().optional(),
    sender_type: z.string().nullable().optional(),
    message_text: z.string().nullable().optional(),
    conversation_url: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "send-live-chat-inquiries-to-your-bookings-channel",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    // Only external contacts get an alert; internal and system messages are skipped.
    if (input.sender_type !== "external") {
      return { skipped: true, reason: "not-an-external-contact" };
    }

    const sender = input.sender_email ?? "Unknown sender";
    const messageText = input.message_text ?? "";
    const preview =
      messageText.length > MESSAGE_PREVIEW_LENGTH
        ? `${messageText.slice(0, MESSAGE_PREVIEW_LENGTH)}…`
        : messageText;
    const permalink = input.conversation_url ?? "";
    const text = [
      `*${sender}*`,
      preview,
      permalink ? `<${permalink}|Open conversation>` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const message = await ctx.step(
      "post-chat-inquiry-to-bookings-channel",
      async () =>
        sdk.runAction({
          appKey: "slack",
          actionType: "write",
          actionKey: "channel_message",
          connection: "slack",
          inputs: {
            channel: BOOKINGS_CHANNEL_ID,
            text,
            username: BOT_NAME,
            icon: BOT_ICON,
            as_bot: "yes",
          },
        }),
    );

    return {
      sender,
      permalink,
      posted: message.data?.[0] ?? null,
    };
  },
);

export default workflow;
