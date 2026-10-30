import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// URL of the intake endpoint that receives each email as JSON for processing.
const INTAKE_ENDPOINT_URL = "YOUR_INTAKE_ENDPOINT_URL";
// Only forward emails whose subject or body contains one of these words (case-insensitive). Empty = forward every email.
const ROUTING_KEYWORDS: string[] = [];
// Only forward emails from these sender addresses (lowercase). Empty = forward from any sender.
const MONITORED_SENDERS: string[] = [];

const InputSchema = z
  .object({
    subject: z.string().nullable().optional(),
    body_plain: z.string().nullable().optional(),
    from: z.unknown().nullable().optional(),
    message_id: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

function senderAddress(from: unknown): string {
  if (typeof from === "string") return from.toLowerCase();
  if (
    from &&
    typeof from === "object" &&
    "email" in from &&
    typeof from.email === "string"
  ) {
    return from.email.toLowerCase();
  }
  return "";
}

const workflow = defineDurable<unknown, unknown>(
  "send-new-email-contents-to-intake-endpoint-for-processing",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const subject = input.subject ?? "";
    const body = input.body_plain ?? "";
    const sender = senderAddress(input.from);
    const messageId =
      input.message_id == null ? null : String(input.message_id);

    const haystack = `${subject}\n${body}`.toLowerCase();
    const keywordMatch =
      ROUTING_KEYWORDS.length === 0 ||
      ROUTING_KEYWORDS.some((word) => haystack.includes(word.toLowerCase()));
    const senderMatch =
      MONITORED_SENDERS.length === 0 || MONITORED_SENDERS.includes(sender);
    if (!keywordMatch || !senderMatch) {
      return { skipped: true, reason: "filter-did-not-match", messageId };
    }

    await ctx.step("post-email-to-intake-endpoint", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: INTAKE_ENDPOINT_URL,
          payload_type: "json",
          extract_variables: "no",
          data: {
            subject,
            message: body,
            sender,
            message_id: messageId,
          },
        },
      }),
    );

    return { posted: true, messageId };
  },
);

export default workflow;
