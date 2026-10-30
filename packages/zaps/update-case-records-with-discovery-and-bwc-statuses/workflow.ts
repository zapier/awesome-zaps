import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Airtable base ID (starts with "app") holding the case table and the KPI table.
const BASE_ID = "YOUR_AIRTABLE_BASE_ID";
// Case table (table ID or name) whose record is matched by Record ID and updated.
const CASE_TABLE = "YOUR_CASE_TABLE_ID";
// KPI tracking table (table ID or name) that receives one entry per track.
const KPI_TABLE = "YOUR_KPI_TABLE_ID";
// Case-table field names. Change these to match your table's headers.
const CASE_FIELDS = {
  discoveryStatus: "Discovery Status",
  bwcStatus: "BWC Status",
  discoveryUpdated: "Discovery Updated",
  bwcUpdated: "BWC Updated",
  verified: "Verified",
  activityLog: "Activity Log",
};
// KPI-table field names. Change these to match your table's headers.
const KPI_FIELDS = {
  case: "Case",
  track: "Track",
  action: "Action",
  verified: "Verified",
  timestamp: "Timestamp",
  note: "Note",
};

const InputSchema = z
  .object({
    record_id: z.string(),
    discovery_status: z.string().nullable().optional(),
    bwc_status: z.string().nullable().optional(),
    user: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
    timestamp: z.string().nullable().optional(),
    verified: z.boolean().nullable().optional(),
  })
  .loose();

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

const workflow = defineDurable<unknown, unknown>(
  "update-case-records-with-discovery-and-bwc-statuses",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));
    const recordId = input.record_id.trim();

    const lookup = await ctx.step("find-case-record", async () =>
      sdk.runAction({
        appKey: "airtable",
        actionType: "search",
        actionKey: "findRecordById",
        connection: "airtable",
        inputs: {
          applicationId: BASE_ID,
          tableName: CASE_TABLE,
          recordId,
        },
      }),
    );

    const record = lookup.data?.[0] as Record<string, unknown> | undefined;
    if (!record?.id) {
      return { skipped: true, reason: "case-not-found", recordId };
    }

    const receivedAt = await ctx.step(
      "capture-received-at",
      async () => input.timestamp ?? new Date().toISOString(),
    );

    const verified = input.verified ?? Boolean(input.user);
    const actor = input.user ?? "unknown user";
    const note = input.note ?? "";
    const logLine = `${receivedAt} | Discovery: ${input.discovery_status ?? "-"} | BWC: ${input.bwc_status ?? "-"} | ${actor} | ${note}`;
    const existingLog =
      typeof record[CASE_FIELDS.activityLog] === "string"
        ? (record[CASE_FIELDS.activityLog] as string)
        : "";
    const activityLog = existingLog ? `${existingLog}\n${logLine}` : logLine;

    const discoveryKpi = await ctx.step(
      "create-discovery-kpi-entry",
      async () =>
        sdk.runAction({
          appKey: "airtable",
          actionType: "write",
          actionKey: "createRecord",
          connection: "airtable",
          inputs: {
            applicationId: BASE_ID,
            tableName: KPI_TABLE,
            [KPI_FIELDS.case]: recordId,
            [KPI_FIELDS.track]: "Discovery",
            [KPI_FIELDS.action]: input.discovery_status ?? "",
            [KPI_FIELDS.verified]: verified,
            [KPI_FIELDS.timestamp]: receivedAt,
            [KPI_FIELDS.note]: note,
          },
        }),
    );

    const bwcKpi = await ctx.step("create-bwc-kpi-entry", async () =>
      sdk.runAction({
        appKey: "airtable",
        actionType: "write",
        actionKey: "createRecord",
        connection: "airtable",
        inputs: {
          applicationId: BASE_ID,
          tableName: KPI_TABLE,
          [KPI_FIELDS.case]: recordId,
          [KPI_FIELDS.track]: "BWC",
          [KPI_FIELDS.action]: input.bwc_status ?? "",
          [KPI_FIELDS.verified]: verified,
          [KPI_FIELDS.timestamp]: receivedAt,
          [KPI_FIELDS.note]: note,
        },
      }),
    );

    const update = await ctx.step("update-case-record", async () =>
      sdk.runAction({
        appKey: "airtable",
        actionType: "write",
        actionKey: "updateRecord",
        connection: "airtable",
        inputs: {
          applicationId: BASE_ID,
          tableName: CASE_TABLE,
          rowId: String(record.id),
          ...(input.discovery_status
            ? {
                [CASE_FIELDS.discoveryStatus]: input.discovery_status,
                [CASE_FIELDS.discoveryUpdated]: receivedAt,
              }
            : {}),
          ...(input.bwc_status
            ? {
                [CASE_FIELDS.bwcStatus]: input.bwc_status,
                [CASE_FIELDS.bwcUpdated]: receivedAt,
              }
            : {}),
          [CASE_FIELDS.verified]: verified,
          [CASE_FIELDS.activityLog]: activityLog,
        },
      }),
    );

    return {
      recordId,
      verified,
      discoveryKpiId: discoveryKpi.data?.[0] ?? null,
      bwcKpiId: bwcKpi.data?.[0] ?? null,
      updated: update.data?.[0] ?? null,
    };
  },
);

export default workflow;
