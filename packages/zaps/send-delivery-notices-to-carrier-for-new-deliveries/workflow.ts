import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Carrier inbox that receives every notice. Replace YOUR_EMAIL_ADDRESS with the carrier's address.
const CARRIER_EMAIL = "YOUR_EMAIL_ADDRESS";
// Skip notices for customers flagged as excluded or test customers in the payload.
const SKIP_EXCLUDED_CUSTOMERS = true;
// Subject prefix for each notice type the payload can send.
const NOTICE_PREFIXES: Record<string, string> = {
  new_pickup: "New pickup",
  weight_update: "Weight update",
  cancellation: "Cancelled delivery",
};

const InputSchema = z
  .object({
    delivery_id: z.union([z.string(), z.number()]),
    notice_type: z.string(),
    customer_excluded: z.boolean().nullable().optional(),
    pickup_date: z.string().nullable().optional(),
    pickup_location: z.string().nullable().optional(),
    delivery_address: z.string().nullable().optional(),
    recipient_name: z.string().nullable().optional(),
    recipient_phone: z.string().nullable().optional(),
    delivery_window: z.string().nullable().optional(),
    total_weight: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "send-delivery-notices-to-carrier-for-new-deliveries",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const deliveryId = String(input.delivery_id).trim();

    if (SKIP_EXCLUDED_CUSTOMERS && input.customer_excluded) {
      return { skipped: true, reason: "excluded-customer", deliveryId };
    }

    const prefix = NOTICE_PREFIXES[input.notice_type];
    if (!prefix) {
      return { skipped: true, reason: "unknown-notice-type", deliveryId };
    }

    const subject = `${prefix} - ${deliveryId}`;
    const body = [
      `Delivery: ${deliveryId}`,
      `Pickup date: ${input.pickup_date ?? "not given"}`,
      `Pickup location: ${input.pickup_location ?? "not given"}`,
      `Delivery address: ${input.delivery_address ?? "not given"}`,
      `Recipient: ${input.recipient_name ?? "not given"}`,
      `Phone: ${input.recipient_phone ?? "not given"}`,
      `Delivery window: ${input.delivery_window ?? "not given"}`,
      `Total weight: ${input.total_weight ?? "not given"}`,
    ].join("\n");

    const sent = await ctx.step("send-carrier-notice", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: [CARRIER_EMAIL],
          subject,
          body,
          body_type: "plain",
        },
      }),
    );

    return {
      deliveryId,
      noticeType: input.notice_type,
      subject,
      sent: sent.data?.[0] ?? null,
    };
  },
);

export default workflow;
