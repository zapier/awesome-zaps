import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  APPOINTMENT_STAFF_REF_FIELD,
  APPOINTMENT_TYPE_FIELD,
  STAFF_OBJECT,
  STAFF_MATCH_FIELD,
  TRANSACTION_OBJECT,
  TX_CREATED_DATE_FIELD,
  TX_STAFF_LOOKUP_FIELD,
  TX_AMOUNT_FIELD,
  TX_MEMO_FIELD,
  TX_CLASSIFICATION_FIELD,
  TX_DETAIL_FIELD,
  TX_CLASSIFICATION_VALUE,
  TX_DETAIL_VALUE,
} from "@/config";
import salesforce from "@/connections/salesforce";

const sdk = createZapierSdk();

// Appointment types that earn the smaller bonus.
const SMALL_TIER_TYPES = ["Standard"];
// Appointment types that earn the larger bonus.
const LARGE_TIER_TYPES = ["Premium"];
// Bonus amounts, in the org's currency.
const SMALL_TIER_AMOUNT = 2.5;
const LARGE_TIER_AMOUNT = 5.0;

const InputSchema = z
  .object({
    Id: z.string().nullable().optional(),
    id: z.string().nullable().optional(),
    Name: z.unknown(),
    CreatedDate: z.unknown(),
    OwnerId: z.unknown(),
  })
  .loose();

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

function asText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function soqlString(value: string): string {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function recordId(record: unknown): string | null {
  const r = record as { Id?: unknown; id?: unknown } | undefined;
  return asText(r?.Id ?? r?.id);
}

const workflow = defineDurable<unknown, unknown>(
  "create-staff-bonus-records-when-appointments-are-added",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput)) as Record<
      string,
      unknown
    >;
    const appointmentId = asText(input.Id ?? input.id);

    const appointmentType = asText(input[APPOINTMENT_TYPE_FIELD]);
    let bonusAmount: number;
    if (appointmentType && LARGE_TIER_TYPES.includes(appointmentType)) {
      bonusAmount = LARGE_TIER_AMOUNT;
    } else if (appointmentType && SMALL_TIER_TYPES.includes(appointmentType)) {
      bonusAmount = SMALL_TIER_AMOUNT;
    } else {
      return {
        skipped: true,
        reason: "appointment-type-not-eligible",
        appointmentId,
        appointmentType,
      };
    }

    const staffReference =
      asText(input[APPOINTMENT_STAFF_REF_FIELD]) ?? asText(input.OwnerId);
    if (!staffReference) {
      return { skipped: true, reason: "no-staff-reference", appointmentId };
    }

    const memo =
      asText(input.Name) ?? `Appointment ${appointmentId ?? ""}`.trim();
    const createdDate =
      asText(input.CreatedDate) ??
      (await ctx.step("capture-created-date", async () =>
        new Date().toISOString(),
      ));

    const staffLookup = await ctx.step("find-staff-record", async () =>
      sdk.runAction({
        appKey: "salesforce",
        actionType: "search",
        actionKey: "find_record_by_query",
        connection: salesforce,
        inputs: {
          object: STAFF_OBJECT,
          whereClause: `${STAFF_MATCH_FIELD} = ${soqlString(staffReference)}`,
          limit: 1,
        },
      }),
    );

    let staffId = recordId(staffLookup.data?.[0]);
    let staffCreated = false;
    if (!staffId) {
      const newStaff = await ctx.step("create-staff-record", async () =>
        sdk.runAction({
          appKey: "salesforce",
          actionType: "write",
          actionKey: "create_record",
          connection: salesforce,
          inputs: {
            object: STAFF_OBJECT,
            Name: staffReference,
            [STAFF_MATCH_FIELD]: staffReference,
          },
        }),
      );
      staffId = recordId(newStaff.data?.[0]);
      staffCreated = true;
      if (!staffId) {
        throw new Error(`Staff record for ${staffReference} was not created`);
      }
    }

    const transaction = await ctx.step(
      "create-staff-account-transaction",
      async () =>
        sdk.runAction({
          appKey: "salesforce",
          actionType: "write",
          actionKey: "create_record",
          connection: salesforce,
          inputs: {
            object: TRANSACTION_OBJECT,
            [TX_CREATED_DATE_FIELD]: createdDate,
            [TX_STAFF_LOOKUP_FIELD]: staffId,
            [TX_AMOUNT_FIELD]: bonusAmount,
            [TX_MEMO_FIELD]: memo,
            [TX_CLASSIFICATION_FIELD]: TX_CLASSIFICATION_VALUE,
            [TX_DETAIL_FIELD]: TX_DETAIL_VALUE,
          },
        }),
    );

    return {
      appointmentId,
      appointmentType,
      bonusAmount,
      staffId,
      staffCreated,
      transactionId: recordId(transaction.data?.[0]),
    };
  },
);

export default workflow;
