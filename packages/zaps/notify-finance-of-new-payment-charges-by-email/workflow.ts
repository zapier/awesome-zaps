import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Finance and billing recipients, comma separated (up to 5). Replace YOUR_FINANCE_EMAIL before use.
const FINANCE_RECIPIENTS = "YOUR_FINANCE_EMAIL";
// Set to false to log the charge without emailing anyone.
const SEND_EMAIL = true;

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    amount: z.union([z.number(), z.string()]).nullable().optional(),
    currency: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "notify-finance-of-new-payment-charges-by-email",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const chargeId = input.id ?? "unknown-charge";
    const amount = input.amount ?? "";
    const currency = (input.currency ?? "").toUpperCase();
    const status = input.status ?? "unknown";
    const permalink = `https://dashboard.stripe.com/payments/${chargeId}`;

    if (!SEND_EMAIL) {
      return { skipped: true, reason: "email-disabled", chargeId };
    }

    const sent = await ctx.step("send-finance-email", async () =>
      sdk.runAction({
        appKey: "email",
        actionType: "write",
        actionKey: "outbound",
        inputs: {
          to: FINANCE_RECIPIENTS,
          subject: `New Stripe charge ${chargeId} (${status})`,
          body: `New charge ${chargeId}: ${amount} ${currency}, status ${status}.\n\nView in Stripe: ${permalink}`,
        },
      }),
    );

    return { chargeId, sent: sent.data?.[0] ?? null };
  },
);

export default workflow;
