import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Endpoint that receives each new sales order (your ERP/CRM Orders endpoint). Anyone with this URL can create orders.
const ORDERS_WEBHOOK_URL = "YOUR_ERP_ORDERS_WEBHOOK_URL";
// Endpoint that receives each sales-order line and the discount line (your ERP/CRM sales-order-lines endpoint).
const ORDER_LINES_WEBHOOK_URL = "YOUR_ERP_ORDER_LINES_WEBHOOK_URL";
// Customer label per Shopify sales channel (sourceName). Channels not listed get "Shopify (<sourceName>)".
const CUSTOMER_LABELS: Record<string, string> = {
  web: "Online Store",
  pos: "Point of Sale",
  shopify_draft_order: "Draft Order",
};

const AddressSchema = z
  .object({
    name: z.string().nullable().optional(),
    address1: z.string().nullable().optional(),
    address2: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    province: z.string().nullable().optional(),
    zip: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
  })
  .loose()
  .nullable()
  .optional();

const MoneySetSchema = z
  .object({
    shopMoney: z
      .object({ amount: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
  })
  .loose()
  .nullable()
  .optional();

const LineItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    title: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    sku: z.string().nullable().optional(),
    quantity: z.union([z.number(), z.string()]).nullable().optional(),
    price: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    sourceName: z.string().nullable().optional(),
    billingAddress: AddressSchema,
    shippingAddress: AddressSchema,
    lineItems: z.array(LineItemSchema).nullable().optional(),
    totalDiscountsSet: MoneySetSchema,
    currencyCode: z.string().nullable().optional(),
  })
  .loose();

type Address = z.infer<typeof AddressSchema>;
type MoneySet = z.infer<typeof MoneySetSchema>;

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

function customerLabel(sourceName: string | null | undefined): string {
  const key = sourceName ?? "";
  return CUSTOMER_LABELS[key] ?? `Shopify (${key || "unknown"})`;
}

function toAddressBody(address: Address) {
  return {
    name: address?.name ?? null,
    line1: address?.address1 ?? null,
    line2: address?.address2 ?? null,
    city: address?.city ?? null,
    region: address?.province ?? null,
    postal_code: address?.zip ?? null,
    country: address?.country ?? null,
  };
}

function moneyAmount(set: MoneySet): number {
  return Number(set?.shopMoney?.amount ?? 0);
}

const workflow = defineDurable<unknown, unknown>(
  "create-sales-orders-and-line-items-from-purchases",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));
    const orderId = String(input.id);
    const reference = input.name ?? orderId;
    const customerName = customerLabel(input.sourceName);

    await ctx.step("create-sales-order", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: ORDERS_WEBHOOK_URL,
          payload_type: "json",
          unflatten: "no",
          extract_variables: "no",
          data: {
            external_id: orderId,
            reference,
            order_date: input.createdAt ?? null,
            customer_name: customerName,
            customer_email: input.email ?? null,
            customer_phone: input.phone ?? null,
            billing_address: toAddressBody(input.billingAddress),
            shipping_address: toAddressBody(input.shippingAddress),
          },
        },
      }),
    );

    const lines = (input.lineItems ?? []).map((item, index) => {
      const quantity = Number(item.quantity ?? 0);
      const unitPrice = Number(item.price ?? 0);
      return {
        index,
        external_id: item.id == null ? null : String(item.id),
        sku: item.sku ?? null,
        description: item.title ?? item.name ?? item.sku ?? "Line item",
        quantity,
        rate: unitPrice.toFixed(2),
        amount: (quantity * unitPrice).toFixed(2),
      };
    });

    // One step per line item; a failed line is recorded and does not stop the others.
    const lineResults = await Promise.all(
      lines.map((line) =>
        ctx.step(`create-sales-order-line-${line.index}`, async () => {
          try {
            await sdk.runAction({
              appKey: "webhook",
              actionType: "write",
              actionKey: "post",
              inputs: {
                url: ORDER_LINES_WEBHOOK_URL,
                payload_type: "json",
                unflatten: "no",
                extract_variables: "no",
                data: {
                  order_external_id: orderId,
                  reference,
                  external_id: line.external_id,
                  sku: line.sku,
                  description: line.description,
                  quantity: line.quantity,
                  rate: line.rate,
                  amount: line.amount,
                },
              },
            });
            return { ok: true, index: line.index };
          } catch (error) {
            return { ok: false, index: line.index, error: String(error) };
          }
        }),
      ),
    );

    const discount = moneyAmount(input.totalDiscountsSet);
    let discountLine: { ok: boolean; error?: string } | null = null;
    if (discount > 0) {
      discountLine = await ctx.step("create-discount-line", async () => {
        try {
          await sdk.runAction({
            appKey: "webhook",
            actionType: "write",
            actionKey: "post",
            inputs: {
              url: ORDER_LINES_WEBHOOK_URL,
              payload_type: "json",
              unflatten: "no",
              extract_variables: "no",
              data: {
                order_external_id: orderId,
                reference,
                external_id: null,
                sku: null,
                description: `Discount on ${reference}`,
                quantity: 1,
                rate: (-discount).toFixed(2),
                amount: (-discount).toFixed(2),
              },
            },
          });
          return { ok: true };
        } catch (error) {
          return { ok: false, error: String(error) };
        }
      });
    }

    const failedLines = lineResults.filter((result) => !result.ok);

    return {
      orderId,
      reference,
      customerName,
      lineCount: lines.length,
      failedLineCount: failedLines.length,
      discountLine,
    };
  },
);

export default workflow;
