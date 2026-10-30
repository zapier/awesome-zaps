import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Billing inbox that receives the alert. Use a Gmail address connected to your account.
const BILLING_EMAIL = "YOUR_BILLING_EMAIL";
// Base link to the subscription record in Stripe; the subscription ID is appended.
const SUBSCRIPTION_LINK_BASE = "https://dashboard.stripe.com/subscriptions/";

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    latest_invoice: z.string().nullable().optional(),
    current_period_end: z.string().nullable().optional(),
    customer: z
      .object({
        id: z.string().nullable().optional(),
        name: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "notify-billing-staff-about-subscription-payment-activity-for-customers",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const subscriptionId = input.id ?? "";
    if (!subscriptionId) {
      return { skipped: true, reason: "missing-subscription-id" };
    }

    const customerName =
      input.customer?.name ?? input.customer?.email ?? "Unknown customer";
    const status = input.status ?? "updated";
    const subject = `${customerName}: subscription ${status}`;
    const body = [
      `Subscription ${subscriptionId} for ${customerName} is now ${status}.`,
      input.latest_invoice ? `Latest invoice: ${input.latest_invoice}` : null,
      input.current_period_end
        ? `Current period ends: ${input.current_period_end}`
        : null,
      `Record: ${SUBSCRIPTION_LINK_BASE}${subscriptionId}`,
    ]
      .filter(Boolean)
      .join("\n");

    const email = await ctx.step("send-billing-alert-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: BILLING_EMAIL,
          subject,
          body,
          body_type: "plain",
        },
      }),
    );

    return {
      sent: true,
      subscriptionId,
      subject,
      emailId: email.data?.[0]?.id ?? null,
    };
  },
);

export default workflow;
