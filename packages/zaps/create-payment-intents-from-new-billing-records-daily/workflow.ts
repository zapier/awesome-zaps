import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table that holds the billing records (the ID in the table's URL).
const TABLE_ID = "YOUR_TABLE_ID";
// Field holding the customer reference, matched against Stripe customers by email.
const CUSTOMER_REF_FIELD = "f1";
// Field holding the amount in major units (e.g. 49.99).
const AMOUNT_FIELD = "f2";
// Field holding the three-letter currency code (e.g. usd).
const CURRENCY_FIELD = "f3";
// Field holding an optional payment description.
const DESCRIPTION_FIELD = "f4";
// Field the created payment intent ID is written to.
const PAYMENT_INTENT_ID_FIELD = "f5";
// Field the payment intent status is written to.
const PAYMENT_STATUS_FIELD = "f6";
// Checkbox field marked true once the record has been processed.
const PROCESSED_FIELD = "f7";
// Whether Stripe should confirm (charge) the intent immediately. Off: intents are only created.
const CONFIRM_PAYMENT = false;

// Currencies Stripe charges in whole units, and those with three decimals.
const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);
const THREE_DECIMAL_CURRENCIES = new Set(["bhd", "jod", "kwd", "omr", "tnd"]);

const RecordSchema = z
  .object({
    id: z.string().nullable().optional(),
    deleted_at: z.string().nullable().optional(),
    data: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .loose();

const InputSchema = z
  .object({
    record_id: z.string().nullable().optional(),
    table_id: z.string().nullable().optional(),
    new: RecordSchema.nullable().optional(),
  })
  .loose();

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

function text(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

function toSmallestUnit(amount: number, currency: string): number {
  if (ZERO_DECIMAL_CURRENCIES.has(currency)) return Math.round(amount);
  if (THREE_DECIMAL_CURRENCIES.has(currency))
    return Math.round(amount * 100) * 10;
  return Math.round(amount * 100);
}

const workflow = defineDurable<unknown, unknown>(
  "create-payment-intents-from-new-billing-records-daily",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));
    const recordId = input.record_id ?? input.new?.id ?? null;
    const data = input.new?.data ?? {};

    if (!recordId || input.new?.deleted_at) {
      return { skipped: true, reason: "no-record" };
    }

    // The write-back below updates this same record, which fires the trigger again.
    const processed =
      data[PROCESSED_FIELD] === true || text(data[PROCESSED_FIELD]) === "true";
    if (processed || text(data[PAYMENT_INTENT_ID_FIELD])) {
      return { skipped: true, reason: "already-processed", recordId };
    }

    const amountText = text(data[AMOUNT_FIELD]).replace(/,/g, "");
    const amount = amountText === "" ? NaN : Number(amountText);
    const currency = text(data[CURRENCY_FIELD]).toLowerCase();
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !/^[a-z]{3}$/.test(currency)
    ) {
      return { skipped: true, reason: "missing-amount-or-currency", recordId };
    }

    const amountMinor = toSmallestUnit(amount, currency);
    const customerRef = text(data[CUSTOMER_REF_FIELD]);
    const description = text(data[DESCRIPTION_FIELD]);

    let customerId: string | null = null;
    if (customerRef) {
      const found = await ctx.step("find-stripe-customer", async () =>
        sdk.runAction({
          appKey: "stripe",
          actionType: "search",
          actionKey: "find_customer",
          connection: "stripe",
          inputs: { query: customerRef, selection: "email" },
        }),
      );
      customerId = (found.data?.[0] as { id?: string } | undefined)?.id ?? null;

      if (!customerId) {
        const created = await ctx.step("create-stripe-customer", async () =>
          sdk.runAction({
            appKey: "stripe",
            actionType: "write",
            actionKey: "create_customer",
            connection: "stripe",
            inputs: { email: customerRef },
          }),
        );
        customerId =
          (created.data?.[0] as { id?: string } | undefined)?.id ?? null;
      }
    }

    const intent = await ctx.step("create-payment-intent", async () =>
      sdk.runAction({
        appKey: "stripe",
        actionType: "write",
        actionKey: "create_payment_intent",
        connection: "stripe",
        inputs: {
          amount: amountMinor,
          currency,
          confirm: String(CONFIRM_PAYMENT),
          ...(customerId ? { customer: customerId } : {}),
          ...(description ? { description } : {}),
          metadata: {
            zapier_table_id: input.table_id ?? TABLE_ID,
            zapier_record_id: recordId,
          },
        },
      }),
    );
    const paymentIntent = intent.data?.[0] as
      { id?: string; status?: string } | undefined;
    if (!paymentIntent?.id) {
      throw new Error("Stripe returned no payment intent ID");
    }

    await ctx.step("mark-record-processed", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "update_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TABLE_ID,
          record_id: recordId,
          [`new__data__${PAYMENT_INTENT_ID_FIELD}`]: paymentIntent.id,
          [`new__data__${PAYMENT_STATUS_FIELD}`]:
            paymentIntent.status ?? "created",
          [`new__data__${PROCESSED_FIELD}`]: "true",
        },
      }),
    );

    return {
      recordId,
      customerId,
      amount: amountMinor,
      currency,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status ?? null,
    };
  },
);

export default workflow;
