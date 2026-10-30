import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Stripe price/plan nicknames that count as membership invoices. Invoices for any other plan are skipped.
const QUALIFYING_PLAN_NAMES = ["YOUR_MEMBERSHIP_PLAN_NAME"];
// Salesforce record type ID for membership opportunities.
const MEMBERSHIP_RECORD_TYPE_ID = "YOUR_MEMBERSHIP_RECORD_TYPE_ID";
// Salesforce API name of the Contact field that holds the Stripe customer ID.
const CONTACT_STRIPE_CUSTOMER_FIELD = "YOUR_CONTACT_STRIPE_CUSTOMER_FIELD__c";
// Salesforce API name of the Opportunity field that holds the Stripe invoice ID (external ID).
const OPPORTUNITY_INVOICE_ID_FIELD = "YOUR_OPPORTUNITY_INVOICE_ID_FIELD__c";
// Salesforce API name of the Opportunity membership plan picklist field.
const OPPORTUNITY_PLAN_FIELD = "YOUR_OPPORTUNITY_PLAN_FIELD__c";
// Opportunity stage set on new opportunities for paid invoices (the revenue recognition stage).
const REVENUE_RECOGNITION_STAGE = "YOUR_REVENUE_RECOGNITION_STAGE";
// Seconds to wait before CRM lookups, so upstream systems finish processing the invoice.
const UPSTREAM_WAIT_SECONDS = 300;

const InvoiceSchema = z
  .object({
    id: z.string(),
    customer: z
      .union([z.string(), z.object({ id: z.string() }).loose()])
      .nullable()
      .optional(),
    customer_name: z.string().nullable().optional(),
    customer_email: z.string().nullable().optional(),
    amount_paid: z.number().nullable().optional(),
    created: z.number().nullable().optional(),
    lines: z
      .object({ data: z.array(z.unknown()) })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

type InvoiceLine = {
  price?: { nickname?: string | null } | null;
  plan?: { nickname?: string | null } | null;
};

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

function isoDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

const workflow = defineDurable<unknown, unknown>(
  "add-opportunities-from-membership-invoices-to-sales-team",
  async (ctx, rawInput) => {
    const invoice = InvoiceSchema.parse(normalizeInput(rawInput));

    const lines = (invoice.lines?.data ?? []) as InvoiceLine[];
    const planName =
      lines
        .map((line) => line.price?.nickname ?? line.plan?.nickname ?? null)
        .find((name) => !!name) ?? null;

    if (!planName || !QUALIFYING_PLAN_NAMES.includes(planName)) {
      return {
        skipped: true,
        reason: "not-a-membership-plan",
        invoiceId: invoice.id,
      };
    }

    const customerId =
      typeof invoice.customer === "string"
        ? invoice.customer
        : (invoice.customer?.id ?? null);
    if (!customerId) {
      return { skipped: true, reason: "no-customer", invoiceId: invoice.id };
    }

    const closeDate = invoice.created ? isoDate(invoice.created) : undefined;
    const amount = (invoice.amount_paid ?? 0) / 100;

    await ctx.wait("wait-for-upstream-sync", UPSTREAM_WAIT_SECONDS);

    const contactLookup = await ctx.step("find-salesforce-contact", async () =>
      sdk.runAction({
        appKey: "salesforce",
        actionType: "search",
        actionKey: "find_record",
        connection: "salesforce",
        inputs: {
          object: "Contact",
          searchField: CONTACT_STRIPE_CUSTOMER_FIELD,
          searchValue: customerId,
        },
      }),
    );

    let contactId =
      (contactLookup.data[0] as { id?: string } | undefined)?.id ?? null;

    if (!contactId) {
      const createdContact = await ctx.step(
        "create-salesforce-contact",
        async () =>
          sdk.runAction({
            appKey: "salesforce",
            actionType: "write",
            actionKey: "create_contact",
            connection: "salesforce",
            inputs: {
              LastName: invoice.customer_name ?? customerId,
              Email: invoice.customer_email ?? undefined,
              [CONTACT_STRIPE_CUSTOMER_FIELD]: customerId,
            },
          }),
      );
      contactId =
        (createdContact.data[0] as { id?: string } | undefined)?.id ?? null;
    }

    const opportunityLookup = await ctx.step(
      "find-salesforce-opportunity",
      async () =>
        sdk.runAction({
          appKey: "salesforce",
          actionType: "search",
          actionKey: "find_record",
          connection: "salesforce",
          inputs: {
            object: "Opportunity",
            searchField: OPPORTUNITY_INVOICE_ID_FIELD,
            searchValue: invoice.id,
          },
        }),
    );

    const existing = opportunityLookup.data[0] as { id?: string } | undefined;
    if (existing) {
      return {
        skipped: true,
        reason: "opportunity-exists",
        invoiceId: invoice.id,
        opportunityId: existing.id ?? null,
      };
    }

    const opportunity = await ctx.step(
      "create-salesforce-opportunity",
      async () =>
        sdk.runAction({
          appKey: "salesforce",
          actionType: "write",
          actionKey: "create_record",
          connection: "salesforce",
          inputs: {
            object: "Opportunity",
            RecordTypeId: MEMBERSHIP_RECORD_TYPE_ID,
            Name: `${planName} invoice ${invoice.id}`,
            StageName: REVENUE_RECOGNITION_STAGE,
            CloseDate: closeDate,
            Amount: amount,
            [OPPORTUNITY_INVOICE_ID_FIELD]: invoice.id,
            [OPPORTUNITY_PLAN_FIELD]: planName,
          },
        }),
    );

    const opportunityId =
      (opportunity.data[0] as { id?: string } | undefined)?.id ?? null;

    if (contactId && opportunityId) {
      await ctx.step("link-primary-contact", async () =>
        sdk.runAction({
          appKey: "salesforce",
          actionType: "write",
          actionKey: "create_record",
          connection: "salesforce",
          inputs: {
            object: "OpportunityContactRole",
            OpportunityId: opportunityId,
            ContactId: contactId,
            IsPrimary: true,
          },
        }),
      );
    }

    return {
      invoiceId: invoice.id,
      opportunityId,
      contactId,
      planName,
      closeDate: closeDate ?? null,
      amount,
    };
  },
);

export default workflow;
