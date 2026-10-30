import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table ID for the product performance table (the ID in the table's URL).
const TABLE_ID = "YOUR_TABLE_ID";

const IdSchema = z.union([z.string(), z.number()]).nullable().optional();

const LineItemSchema = z
  .object({
    id: IdSchema,
    name: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    sku: z.string().nullable().optional(),
    quantity: z.union([z.number(), z.string()]).nullable().optional(),
    price: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

const InputSchema = z
  .object({
    id: IdSchema,
    name: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    customer: z.object({ id: IdSchema }).loose().nullable().optional(),
    lineItems: z.array(LineItemSchema).nullable().optional(),
  })
  .loose();

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

const workflow = defineDurable<unknown, unknown>(
  "create-sku-level-product-records-from-each-online-order",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));
    const lineItems = input.lineItems ?? [];

    if (lineItems.length === 0) {
      return {
        skipped: true,
        reason: "no-line-items",
        orderReference: input.name ?? null,
      };
    }

    const orderReference = input.name ?? String(input.id ?? "");
    const customerReference = String(input.customer?.id ?? "");
    const orderDate =
      input.createdAt ??
      (await ctx.step("capture-order-date", async () =>
        new Date().toISOString(),
      ));

    let created = 0;
    let failed = 0;

    // One record per line item. Each item has its own step so a failure is recorded and the rest still run.
    for (const [index, item] of lineItems.entries()) {
      const quantity = Number(item.quantity ?? 0);
      const unitPrice = Number(item.price ?? 0);
      const totalRevenue = (unitPrice * quantity).toFixed(2);

      const outcome = await ctx.step(
        `create-product-record-${index}`,
        async () => {
          try {
            const result = await sdk.runAction({
              appKey: "zapier-tables",
              actionType: "write",
              actionKey: "create_record",
              connection: "zapier-tables",
              inputs: {
                table_id: TABLE_ID,
                new__data__f1: item.name ?? item.title ?? "",
                new__data__f2: item.sku ?? "",
                new__data__f3: String(quantity),
                new__data__f4: String(unitPrice),
                new__data__f5: totalRevenue,
                new__data__f6: orderDate,
                new__data__f7: orderReference,
                new__data__f8: customerReference,
              },
            });
            return { ok: true, recordId: result.data?.[0]?.record_id ?? null };
          } catch (error) {
            return {
              ok: false,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
      );

      if (outcome.ok) {
        created += 1;
      } else {
        failed += 1;
      }
    }

    return { orderReference, lineItems: lineItems.length, created, failed };
  },
);

export default workflow;
