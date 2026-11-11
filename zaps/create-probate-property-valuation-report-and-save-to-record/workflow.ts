import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  TABLE_ID,
  TEMPLATE_DOC_ID,
  FOLDER_ID,
  SHARING_PREFERENCE,
} from "@/config";
import zapierTables from "@/connections/zapier-tables";
import googleDocs from "@/connections/google-docs";

const sdk = createZapierSdk();

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const InputSchema = z
  .object({
    record_id: z.union([z.string(), z.number()]),
  })
  .loose();

type RecordFields = {
  f1?: string | null; // Case title
  f2?: string | null; // Property address
  f3?: string | null; // Valuation date
  f4?: string | null; // Date of death
  f5?: string | null; // Comparables
};

function formatComparables(text: string | null | undefined): string {
  return (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

// Turns a stored ISO date ("2026-03-14") into "14 March 2026" without Date, which the durable runtime forbids outside a step.
function prettyDate(value: string | null | undefined): string {
  const [year, month, day] = (value ?? "")
    .trim()
    .slice(0, 10)
    .split("-")
    .map(Number);
  if (!year || !month || !day) return (value ?? "").trim();
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

const workflow = defineDurable<unknown, unknown>(
  "create-probate-property-valuation-report-and-save-to-record",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const recordId = String(input.record_id).trim();

    const lookup = await ctx.step("find-valuation-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        connection: zapierTables,
        inputs: {
          table_id: TABLE_ID,
          filter_count: "1",
          field_data_key: "id",
          operator: "exact",
          lookup_value: recordId,
        },
      }),
    );

    const match = lookup.data?.[0] as
      { old?: { data?: RecordFields } } | undefined;
    const fields: RecordFields | undefined = match?.old?.data;
    if (!fields) {
      return { skipped: true, reason: "record-not-found", recordId };
    }
    const address = (fields.f2 ?? "").trim();

    const report = await ctx.step("create-valuation-report", async () =>
      sdk.runAction({
        appKey: "google-docs",
        actionType: "write",
        actionKey: "create_from_template",
        connection: googleDocs,
        inputs: {
          file: TEMPLATE_DOC_ID,
          title: `Probate valuation report - ${address || recordId}`,
          folder: FOLDER_ID,
          sharing_preference: SHARING_PREFERENCE,
          empty_fields_preference: "remove",
          template_field__case_title: fields.f1 ?? "",
          template_field__property_address: fields.f2 ?? "",
          template_field__valuation_date: prettyDate(fields.f3),
          template_field__date_of_death: prettyDate(fields.f4),
          template_field__comparables: formatComparables(fields.f5),
        },
      }),
    );

    const document = report.data[0] as
      { id?: string; alternateLink?: string } | undefined;
    if (!document?.id || !document.alternateLink) {
      throw new Error("Google Docs did not return a document ID and link");
    }

    const saved = await ctx.step("save-report-link", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "update_record",
        connection: zapierTables,
        inputs: {
          table_id: TABLE_ID,
          record_id: recordId,
          new__data__f6: document.alternateLink,
          new__data__f7: document.id,
        },
      }),
    );

    return {
      recordId,
      documentId: document.id,
      reportLink: document.alternateLink,
      updated: saved.data[0] ?? null,
    };
  },
);

export default workflow;
