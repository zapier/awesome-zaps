import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  AIRTABLE_BASE_ID,
  AIRTABLE_TABLE,
  FIELD_EXTERNAL_REF,
  FIELD_APPLIED_AT,
  FIELD_FULL_NAME,
  FIELD_EMAIL,
  FIELD_PHONE,
  FIELD_BUSINESS_NAME,
  FIELD_REVENUE,
  FIELD_CAMPAIGN,
  FIELD_AD_SET,
  FIELD_AD,
  FIELD_FORM,
  FIELD_SOURCE,
  SOURCE_LABEL,
  LEAD_PHONE_KEY,
  LEAD_BUSINESS_NAME_KEY,
  LEAD_REVENUE_KEY,
  TIME_ZONE,
} from "@/config";
import airtable from "@/connections/airtable";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    created_time: z.string().nullable().optional(),
    FULL_NAME: z.string().nullable().optional(),
    EMAIL: z.string().nullable().optional(),
    campaign_name: z.string().nullable().optional(),
    campaign_id: z.string().nullable().optional(),
    adset_name: z.string().nullable().optional(),
    ad_name: z.string().nullable().optional(),
    form_name: z.string().nullable().optional(),
    platform: z.string().nullable().optional(),
  })
  .loose();

function pick(input: Record<string, unknown>, key: string): string | null {
  const value = input[key] ?? input[key.toLowerCase()];
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function formatTimestamp(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TIME_ZONE,
    timeZoneName: "short",
  }).format(date);
}

function normalizePhone(value: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  return value.trim().startsWith("+") ? `+${digits}` : digits;
}

function normalizeRevenue(value: string | null): number | null {
  if (!value) return null;
  const match = value
    .toLowerCase()
    .replace(/,/g, "")
    .match(/(\d+(?:\.\d+)?)\s*([km])?/);
  if (!match) return null;
  const multiplier =
    match[2] === "m" ? 1_000_000 : match[2] === "k" ? 1_000 : 1;
  return Math.round(Number(match[1]) * multiplier);
}

const workflow = defineDurable<unknown, unknown>(
  "create-loan-application-records-from-social-lead-forms",
  async (ctx, rawInput) => {
    const raw = (
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput
    ) as Record<string, unknown>;
    const input = InputSchema.parse(raw);

    const email = (input.EMAIL ?? pick(raw, "EMAIL") ?? "")
      .trim()
      .toLowerCase();
    const fullName = (input.FULL_NAME ?? "").trim();
    // Qualifying submission: has a usable email to match on and a name.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !fullName) {
      return {
        skipped: true,
        reason: "not-qualifying",
        submissionId: input.id ?? null,
      };
    }

    const fields: Record<string, unknown> = {
      [FIELD_EXTERNAL_REF]: input.id ?? null,
      [FIELD_APPLIED_AT]: formatTimestamp(input.created_time ?? null),
      [FIELD_FULL_NAME]: fullName,
      [FIELD_EMAIL]: email,
      [FIELD_PHONE]: normalizePhone(pick(raw, LEAD_PHONE_KEY)),
      [FIELD_BUSINESS_NAME]: pick(raw, LEAD_BUSINESS_NAME_KEY),
      [FIELD_REVENUE]: normalizeRevenue(pick(raw, LEAD_REVENUE_KEY)),
      [FIELD_CAMPAIGN]: input.campaign_name ?? null,
      [FIELD_AD_SET]: input.adset_name ?? null,
      [FIELD_AD]: input.ad_name ?? null,
      [FIELD_FORM]: input.form_name ?? null,
      [FIELD_SOURCE]: SOURCE_LABEL,
    };
    for (const key of Object.keys(fields)) {
      if (fields[key] === null) delete fields[key];
    }

    // Upsert: update the record whose email matches, or create one.
    const upsert = await ctx.step("upsert-loan-application-record", async () =>
      sdk.runAction({
        appKey: "airtable",
        actionType: "write",
        actionKey: "_zap_raw_request",
        connection: airtable,
        inputs: {
          method: "PATCH",
          url: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            performUpsert: { fieldsToMergeOn: [FIELD_EMAIL] },
            typecast: true,
            records: [{ fields }],
          }),
          fail_on_errors: true,
        },
      }),
    );

    const response = upsert.data?.[0] as
      { response?: { status?: number; body?: unknown } } | undefined;
    const body = response?.response?.body as
      | {
          records?: { id?: string }[];
          createdRecords?: string[];
          updatedRecords?: string[];
        }
      | undefined;

    return {
      email,
      submissionId: input.id ?? null,
      recordId: body?.records?.[0]?.id ?? null,
      created: (body?.createdRecords?.length ?? 0) > 0,
      updated: (body?.updatedRecords?.length ?? 0) > 0,
      status: response?.response?.status ?? null,
    };
  },
);

export default workflow;
