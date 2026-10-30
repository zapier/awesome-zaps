import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Feedback survey link, used when the cancellation payload has no feedback_url of its own.
const FEEDBACK_FORM_URL = "YOUR_FEEDBACK_FORM_URL";
// Retention inbox copied on every email; leave empty to send to the customer only.
const RETENTION_INBOX_CC = "";

const InputSchema = z
  .object({
    customer_email: z.string().nullable().optional(),
    customer_name: z.string().nullable().optional(),
    owner_name: z.string().nullable().optional(),
    cancellation_reason: z.string().nullable().optional(),
    cancelled_at: z.string().nullable().optional(),
    submission_id: z.union([z.string(), z.number()]).nullable().optional(),
    feedback_url: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "send-exit-feedback-request-to-departing-customer-owner",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const email = (input.customer_email ?? "").trim().toLowerCase();
    if (!email) {
      return {
        skipped: true,
        reason: "no-customer-email",
        submissionId: input.submission_id ?? null,
      };
    }

    const firstName =
      (input.customer_name ?? "").trim().split(/\s+/)[0] || "there";
    const reason = (input.cancellation_reason ?? "").trim();
    const cancelledOn = await ctx.step("format-cancelled-on", async () => {
      const cancelledAt = new Date(input.cancelled_at ?? "");
      return isNaN(cancelledAt.getTime())
        ? ""
        : cancelledAt.toISOString().slice(0, 10);
    });
    const feedbackLink = input.feedback_url || FEEDBACK_FORM_URL;

    const subject = `Sorry to see you go, ${firstName}`;
    const body = [
      `Hi ${firstName},`,
      "",
      `We're sorry to see your membership end${cancelledOn ? ` on ${cancelledOn}` : ""}.`,
      reason ? `You mentioned: "${reason}". Thank you for telling us.` : "",
      "",
      `Could you take two minutes to tell us what we could have done better? ${feedbackLink}`,
      "",
      "Thanks,",
      input.owner_name || "Your account team",
    ].join("\n");

    const sent = await ctx.step("send-exit-feedback-email", async () =>
      sdk.runAction({
        appKey: "microsoft-outlook",
        actionType: "write",
        actionKey: "send_email",
        connection: "microsoft-outlook",
        inputs: {
          recipients: [email],
          subject,
          body,
          bodyFormat: "Text",
          ...(RETENTION_INBOX_CC ? { ccRecipients: [RETENTION_INBOX_CC] } : {}),
        },
      }),
    );

    return {
      submissionId: input.submission_id ?? null,
      recipient: email,
      sent: sent.data?.[0] ?? null,
    };
  },
);

export default workflow;
