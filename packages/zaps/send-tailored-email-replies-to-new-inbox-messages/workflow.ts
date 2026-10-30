import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Company signature block, as HTML, appended to every reply.
const COMPANY_SIGNATURE_HTML = "<p>YOUR_COMPANY_SIGNATURE</p>";
// Seconds to wait before replying, so the sender can correct or add information.
const REPLY_DELAY_SECONDS = 300;
// Messages whose preview is this short and start with a thank-you or confirmation are skipped.
const ACK_MAX_PREVIEW_CHARS = 40;

const InputSchema = z
  .object({
    from: z
      .object({
        emailAddress: z
          .object({
            name: z.string().nullable().optional(),
            address: z.string(),
          })
          .loose(),
      })
      .loose(),
    subject: z.string().nullable().optional(),
    bodyPreview: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "send-tailored-email-replies-to-new-inbox-messages",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const senderAddress = input.from.emailAddress.address;
    const senderName = input.from.emailAddress.name ?? "";
    const subject = (input.subject ?? "").trim();
    const preview = (input.bodyPreview ?? "").trim();

    const isThreadReply = /^(re|fw|fwd):/i.test(subject);
    const isAcknowledgment =
      preview.length <= ACK_MAX_PREVIEW_CHARS &&
      /^(thanks|thank you|thx|ok|okay|got it|received|noted|perfect|great)\b/i.test(
        preview,
      );
    if (isThreadReply || isAcknowledgment) {
      return {
        skipped: true,
        reason: isThreadReply ? "thread-reply" : "acknowledgment",
      };
    }

    await ctx.wait("wait-before-reply", REPLY_DELAY_SECONDS);

    const draft = await ctx.step("draft-reply-with-ai", async () =>
      sdk.runAction({
        appKey: "ai",
        actionType: "write",
        actionKey: "get_completion",
        inputs: {
          model_id: "standard/auto",
          authentication_id: "0",
          instructions:
            "Write a concise, polite reply to the inbound email described in the input fields. Use the sender's first name in the greeting if one is given, otherwise use a neutral greeting. Write a 1-2 sentence body that acknowledges the message, then a warm closing. Return only an HTML fragment (no html, head or body tags, no signature).",
          inputFields: {
            sender_name: senderName,
            subject,
            preview,
          },
          includeWorkflowData: false,
          outputFields: [{ name: "html", type: "text", isRequired: true }],
        },
      }),
    );

    const replyHtml = String(draft.data?.[0]?.html ?? "").trim();
    if (!replyHtml) {
      return { skipped: true, reason: "empty-reply", senderAddress };
    }

    const sent = await ctx.step("send-reply-email", async () =>
      sdk.runAction({
        appKey: "microsoft-outlook",
        actionType: "write",
        actionKey: "send_email",
        connection: "microsoft-outlook",
        inputs: {
          recipients: [senderAddress],
          subject: `Re: ${subject || "your message"}`,
          body: `${replyHtml}${COMPANY_SIGNATURE_HTML}`,
          bodyFormat: "HTML",
        },
      }),
    );

    return { replied: senderAddress, sent: sent.data?.[0] ?? null };
  },
);

export default workflow;
