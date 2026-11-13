import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  CARTONCLOUD_TENANT,
  CARTONCLOUD_CUSTOMER,
  IT_ALERT_EMAIL,
} from "./config.ts";

const sdk = createZapierSdk();

// Invoices with a total from 0 up to this amount count as zero or near-zero.
const MAX_INVOICE_TOTAL = 1;
// Invoices whose reference contains any of these words are skipped. Empty skips nothing.
const SKIP_BRANCH_INDICATORS: string[] = [];

const InvoiceSchema = z
  .object({
    invoice: z
      .object({
        InvoiceNumber: z.string().nullable().optional(),
        InvoiceID: z.string().nullable().optional(),
        Reference: z.string().nullable().optional(),
        Status: z.string().nullable().optional(),
        Total: z.string().nullable().optional(),
        CurrencyCode: z.string().nullable().optional(),
        InvoicePDF: z.string().nullable().optional(),
        LineItems: z.unknown().optional(),
        Contact: z
          .object({
            Name: z.string().nullable().optional(),
            Address: z
              .object({
                AddressLine1: z.string().nullable().optional(),
                City: z.string().nullable().optional(),
                PostalCode: z.string().nullable().optional(),
                Region: z.string().nullable().optional(),
              })
              .loose()
              .nullable()
              .optional(),
            Address_POBOX: z
              .object({
                AddressLine1: z.string().nullable().optional(),
              })
              .loose()
              .nullable()
              .optional(),
          })
          .loose()
          .nullable()
          .optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

type LineItem = { ItemCode?: string | null; Quantity?: number | string | null };

const workflow = defineDurable(
  "create-dispatch-orders-from-zero-paid-invoices-for-ops",
  async (ctx, rawInput) => {
    const payload = InvoiceSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const invoice = payload.invoice ?? {};
    const contact = invoice.Contact ?? {};
    const address = contact.Address ?? {};
    const poBox = contact.Address_POBOX ?? {};
    const reference = invoice.InvoiceNumber ?? invoice.InvoiceID ?? "unknown";

    const total = Number(invoice.Total);
    if (
      invoice.Status?.toLowerCase() !== "paid" ||
      !Number.isFinite(total) ||
      total < 0 ||
      total > MAX_INVOICE_TOTAL
    ) {
      return { skipped: true, reason: "not-zero-paid-invoice", reference };
    }

    const invoiceReference = (invoice.Reference ?? "").toLowerCase();
    if (
      SKIP_BRANCH_INDICATORS.some((term) =>
        invoiceReference.includes(term.toLowerCase()),
      )
    ) {
      return { skipped: true, reason: "branch-indicator", reference };
    }

    const lineItems = Array.isArray(invoice.LineItems)
      ? (invoice.LineItems as LineItem[])
      : [];
    const items = lineItems.map((line) => ({
      product_code: line.ItemCode ?? undefined,
      quantity: line.Quantity ?? undefined,
    }));

    try {
      const order = await ctx.step(
        "create-cartoncloud-outbound-order",
        async () =>
          sdk.runAction({
            appKey: "cartoncloud",
            actionType: "write",
            actionKey: "create_outbound_order",
            connection: "cartoncloud",
            inputs: {
              tenant: CARTONCLOUD_TENANT,
              customer: CARTONCLOUD_CUSTOMER,
              order_reference: reference,
              currency: invoice.CurrencyCode ?? undefined,
              invoice_value: total,
              address_contact: contact.Name ?? undefined,
              address_street: address.AddressLine1 ?? undefined,
              address_street_2: poBox.AddressLine1 ?? undefined,
              address_city: address.City ?? undefined,
              address_state_code: address.Region ?? undefined,
              address_postcode: address.PostalCode ?? undefined,
              items,
              ...(invoice.InvoicePDF
                ? { all_documents: invoice.InvoicePDF }
                : {}),
            },
          }),
      );

      return { created: true, reference, order: order.data?.[0] ?? null };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      await ctx.step("send-it-failure-notice", async () =>
        sdk.runAction({
          appKey: "gmail",
          actionType: "write",
          actionKey: "message",
          connection: "gmail",
          inputs: {
            to: IT_ALERT_EMAIL,
            subject: `[Dispatch orders] Order creation failed for invoice ${reference}`,
            body: `Creating the CartonCloud outbound order for Xero invoice ${reference} failed.\n\nError: ${message}`,
          },
        }),
      );

      return { created: false, reference, error: message };
    }
  },
);

export default workflow;
