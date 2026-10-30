import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Billing lead who receives each credit alert (comma-separate up to 5 addresses).
const BILLING_LEAD_EMAIL = "YOUR_BILLING_LEAD_EMAIL";
// Only alert when the transaction total is strictly greater than this amount.
const MIN_CREDIT_AMOUNT = 0;
// Xero statuses that count as posted; DELETED and VOIDED transactions are skipped.
const POSTED_STATUSES = ["AUTHORISED"];
// Display name the alert is sent from.
const FROM_NAME = "Xero credit alerts";

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    BankTransactionID: z.string().nullable().optional(),
    Type: z.string().nullable().optional(),
    Status: z.string().nullable().optional(),
    Total: z.union([z.number(), z.string()]).nullable().optional(),
    SubTotal: z.union([z.number(), z.string()]).nullable().optional(),
    TotalTax: z.union([z.number(), z.string()]).nullable().optional(),
    CurrencyCode: z.string().nullable().optional(),
    Reference: z.string().nullable().optional(),
    Date: z.string().nullable().optional(),
    DateString: z.string().nullable().optional(),
    IsReconciled: z.union([z.boolean(), z.string()]).nullable().optional(),
    Contact: z
      .object({ Name: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
    BankAccount: z
      .object({
        Name: z.string().nullable().optional(),
        Code: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
    LineItems: z.unknown(),
  })
  .loose();

function lineItemDescriptions(lineItems: unknown): string[] {
  const items = Array.isArray(lineItems)
    ? lineItems
    : lineItems
      ? [lineItems]
      : [];
  return items
    .map((item) =>
      typeof item === "string"
        ? item
        : (item as { Description?: unknown })?.Description,
    )
    .filter((d): d is string => typeof d === "string" && d.trim() !== "")
    .map((d) => d.trim());
}

const workflow = defineDurable<unknown, unknown>(
  "email-credit-transaction-alerts-to-billing-lead-immediately",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const transactionId = input.BankTransactionID ?? input.id ?? null;
    const type = (input.Type ?? "").toUpperCase();
    const status = (input.Status ?? "").toUpperCase();
    const total = Number(input.Total ?? 0);

    // Credits in Xero are the RECEIVE types (RECEIVE, RECEIVE-OVERPAYMENT, RECEIVE-PREPAYMENT, RECEIVE-TRANSFER).
    const isCredit = type.startsWith("RECEIVE");
    const isPosted = POSTED_STATUSES.includes(status);
    const isAboveThreshold =
      Number.isFinite(total) && total > MIN_CREDIT_AMOUNT;
    if (!isCredit || !isPosted || !isAboveThreshold) {
      return {
        skipped: true,
        reason: !isCredit
          ? "not-a-credit"
          : !isPosted
            ? "not-posted"
            : "below-threshold",
        transactionId,
        type,
        status,
        total,
      };
    }

    const currency = input.CurrencyCode ?? "";
    const amount = `${total.toFixed(2)}${currency ? ` ${currency}` : ""}`;
    const payee = input.Contact?.Name ?? "(no contact)";
    const accountName = input.BankAccount?.Name ?? "(unknown account)";
    const accountCode = input.BankAccount?.Code ?? null;
    const date = input.DateString ?? input.Date ?? "(no date)";
    const reference = input.Reference ?? "(no reference)";
    const descriptions = lineItemDescriptions(input.LineItems);
    const description = descriptions.length
      ? descriptions.join("; ")
      : "(no description)";

    const subject = `Credit received: ${amount} into ${accountName}`;
    const body = [
      "A new credit bank transaction was posted in Xero.",
      "",
      `Payee: ${payee}`,
      `Amount: ${amount}`,
      `Bank account: ${accountName}${accountCode ? ` (${accountCode})` : ""}`,
      `Date: ${date}`,
      `Reference: ${reference}`,
      `Description: ${description}`,
      `Transaction type: ${type}`,
      `Reconciled: ${input.IsReconciled === true || input.IsReconciled === "true" ? "yes" : "no"}`,
      `Transaction ID: ${transactionId ?? "(none)"}`,
    ].join("\n");

    const email = await ctx.step("send-credit-alert-email", async () =>
      sdk.runAction({
        appKey: "email",
        actionType: "write",
        actionKey: "outbound",
        inputs: {
          to: BILLING_LEAD_EMAIL,
          subject,
          body,
          from_name: FROM_NAME,
          force_linebreaks: "true",
        },
      }),
    );

    const sent = email.data?.[0] as { id?: string } | undefined;
    return {
      transactionId,
      amount,
      payee,
      accountName,
      subject,
      emailId: sent?.id ?? null,
    };
  },
);

export default workflow;
