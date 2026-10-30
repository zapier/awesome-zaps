import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Shopify product ID that qualifies a paid order for provisioning.
const QUALIFYING_PRODUCT_ID = "YOUR_SHOPIFY_PRODUCT_ID";
// User management API endpoint that receives the user record (POST, JSON).
const USER_API_URL = "YOUR_USER_MANAGEMENT_API_URL";
// Access status sent with each user record. New users default to active.
const ACCESS_STATUS = "active";

const AddressSchema = z.object({}).loose().nullable().optional();

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    email: z.string().nullable().optional(),
    customer: z
      .object({
        first_name: z.string().nullable().optional(),
        last_name: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
    line_items: z
      .array(
        z
          .object({
            product_id: z.union([z.string(), z.number()]).nullable().optional(),
          })
          .loose(),
      )
      .nullable()
      .optional(),
    billing_address: AddressSchema,
    shipping_address: AddressSchema,
  })
  .loose();

function summarizeAddress(address: unknown): string {
  if (!address || typeof address !== "object") return "";
  const a = address as Record<string, unknown>;
  return [a.address1, a.city, a.province, a.country]
    .filter((part) => typeof part === "string" && part.length > 0)
    .join(", ");
}

const workflow = defineDurable<unknown, unknown>(
  "create-and-update-access-records-for-purchased-product",
  async (ctx, rawInput) => {
    const order = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const qualifies = (order.line_items ?? []).some(
      (item) => String(item.product_id ?? "") === QUALIFYING_PRODUCT_ID,
    );
    if (!qualifies) {
      return {
        skipped: true,
        reason: "no-qualifying-product",
        orderId: order.id ?? null,
      };
    }

    const email = (order.customer?.email ?? order.email ?? "").trim();
    if (!email) {
      return { skipped: true, reason: "no-email", orderId: order.id ?? null };
    }

    const firstName = order.customer?.first_name ?? "";
    const lastName = order.customer?.last_name ?? "";

    const record = await ctx.step("post-user-record", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: USER_API_URL,
          payload_type: "json",
          unflatten: "no",
          extract_variables: "no",
          data: {
            email,
            name: `${firstName} ${lastName}`.trim(),
            access_status: ACCESS_STATUS,
            billing_summary: summarizeAddress(order.billing_address),
            shipping_summary: summarizeAddress(order.shipping_address),
          },
        },
      }),
    );

    return {
      skipped: false,
      email,
      accessStatus: ACCESS_STATUS,
      response: record.data[0] ?? null,
    };
  },
);

export default workflow;
