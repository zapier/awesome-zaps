import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Salesforce object (API name) that holds the loans.
const LOAN_OBJECT = "YOUR_LOAN_OBJECT_API_NAME";
// Field on the loan object that stores the external loan ID from the feed.
const EXTERNAL_LOAN_ID_FIELD = "YOUR_EXTERNAL_LOAN_ID_FIELD";
// CRM field keys for the values the feed updates. Set each to the matching field's key on LOAN_OBJECT.
const CRM_FIELDS = {
  // Loan status picklist.
  status: "YOUR_LOAN_STATUS_FIELD",
  // Property address parts.
  propertyStreet: "YOUR_PROPERTY_STREET_FIELD",
  propertyCity: "YOUR_PROPERTY_CITY_FIELD",
  propertyState: "YOUR_PROPERTY_STATE_FIELD",
  propertyPostalCode: "YOUR_PROPERTY_POSTAL_CODE_FIELD",
  // Finance amounts and rate.
  principalBalance: "YOUR_PRINCIPAL_BALANCE_FIELD",
  interestRate: "YOUR_INTEREST_RATE_FIELD",
  // Key dates.
  nextPaymentDate: "YOUR_NEXT_PAYMENT_DATE_FIELD",
  maturityDate: "YOUR_MATURITY_DATE_FIELD",
};

// The feed's field names are the keys below. Confirm them against a real sample payload before going live.
const InputSchema = z
  .object({
    loan_id: z.union([z.string(), z.number()]),
    status: z.string().nullable().optional(),
    property_street: z.string().nullable().optional(),
    property_city: z.string().nullable().optional(),
    property_state: z.string().nullable().optional(),
    property_postal_code: z.string().nullable().optional(),
    principal_balance: z.union([z.string(), z.number()]).nullable().optional(),
    interest_rate: z.union([z.string(), z.number()]).nullable().optional(),
    next_payment_date: z.string().nullable().optional(),
    maturity_date: z.string().nullable().optional(),
  })
  .loose();

// Formatter: turn "10/31/2026" or "2026-10-31T..." into YYYY-MM-DD. Returns null if unparseable.
function toIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toISOString().slice(0, 10);
}

// Formatter: turn "$1,234.50" or 1234.5 into a number. Returns null if unparseable.
function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).replace(/[$,\s]/g, ""));
  return Number.isNaN(parsed) ? null : parsed;
}

const workflow = defineDurable<unknown, unknown>(
  "update-loan-records-from-external-loan-status-feed",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const externalLoanId = String(input.loan_id).trim();

    const lookup = await ctx.step("find-crm-loan", async () =>
      sdk.runAction({
        appKey: "salesforce",
        actionType: "search",
        actionKey: "find_record",
        connection: "salesforce",
        inputs: {
          object: LOAN_OBJECT,
          searchField: EXTERNAL_LOAN_ID_FIELD,
          searchValue: externalLoanId,
        },
      }),
    );

    const loan = lookup.data?.[0] as { id?: string } | undefined;
    if (!loan?.id) {
      return { skipped: true, reason: "loan-not-found", externalLoanId };
    }

    const changed = [
      input.status,
      input.next_payment_date,
      input.maturity_date,
    ].some((value) => value !== null && value !== undefined && value !== "");
    if (!changed) {
      return {
        skipped: true,
        reason: "no-status-or-date-change",
        externalLoanId,
      };
    }

    const values: Record<string, string | number | null> = {
      [CRM_FIELDS.status]: input.status ?? null,
      [CRM_FIELDS.propertyStreet]: input.property_street ?? null,
      [CRM_FIELDS.propertyCity]: input.property_city ?? null,
      [CRM_FIELDS.propertyState]: input.property_state ?? null,
      [CRM_FIELDS.propertyPostalCode]: input.property_postal_code ?? null,
      [CRM_FIELDS.principalBalance]: toNumber(input.principal_balance),
      [CRM_FIELDS.interestRate]: toNumber(input.interest_rate),
      [CRM_FIELDS.nextPaymentDate]: toIsoDate(input.next_payment_date),
      [CRM_FIELDS.maturityDate]: toIsoDate(input.maturity_date),
    };

    const update = await ctx.step("update-crm-loan", async () =>
      sdk.runAction({
        appKey: "salesforce",
        actionType: "write",
        actionKey: "update_record_utc",
        connection: "salesforce",
        inputs: {
          object: LOAN_OBJECT,
          record_id: loan.id,
          ...values,
        },
      }),
    );

    return {
      externalLoanId,
      recordId: loan.id,
      updated: update.data?.[0] ?? null,
    };
  },
);

export default workflow;
