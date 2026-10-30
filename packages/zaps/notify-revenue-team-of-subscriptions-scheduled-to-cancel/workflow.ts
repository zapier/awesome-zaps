import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Revenue team address that receives the cancellation alert (replace with your distribution list).
const REVENUE_TEAM_EMAIL = "YOUR_REVENUE_TEAM_EMAIL";
// Account owner address that receives the same alert (replace with your account owner's address).
const ACCOUNT_OWNER_EMAIL = "YOUR_ACCOUNT_OWNER_EMAIL";

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    cancel_at_period_end: z
      .union([z.boolean(), z.string()])
      .nullable()
      .optional(),
    current_period_end: z.union([z.string(), z.number()]).nullable().optional(),
    customer__id: z.string().nullable().optional(),
    customer__name: z.string().nullable().optional(),
    customer__email: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "notify-revenue-team-of-subscriptions-scheduled-to-cancel",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const scheduledToCancel =
      input.cancel_at_period_end === true ||
      input.cancel_at_period_end === "true";
    if (!scheduledToCancel) {
      return { skipped: true, reason: "not-scheduled-to-cancel" };
    }

    const subscriptionId = input.id ?? "unknown";
    const customerName = input.customer__name ?? "Unknown customer";
    const customerEmail = input.customer__email ?? "no email on file";
    const customerId = input.customer__id ?? "unknown";
    const periodEnd = input.current_period_end ?? "end of billing period";

    const subject = `Subscription scheduled to cancel: ${customerName}`;
    const body = [
      `${customerName} has a subscription scheduled to cancel at the end of the billing period.`,
      "",
      `Subscription ID: ${subscriptionId}`,
      `Customer ID: ${customerId}`,
      `Customer email: ${customerEmail}`,
      `Current period ends: ${periodEnd}`,
      "",
      "Start retention outreach before the period ends.",
    ].join("\n");

    await ctx.step("send-cancellation-alert", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: [REVENUE_TEAM_EMAIL, ACCOUNT_OWNER_EMAIL],
          subject,
          body,
          body_type: "plain",
        },
      }),
    );

    return { subscriptionId, customerName, notified: true };
  },
);

export default workflow;
