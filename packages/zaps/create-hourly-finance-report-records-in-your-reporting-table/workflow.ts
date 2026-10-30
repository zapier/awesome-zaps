import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

const sdk = createZapierSdk();

// Salesforce report to run each hour (the report's ID, the 15/18-character ID in its URL).
const REPORT_ID = "YOUR_REPORT_ID";
// Detail columns of that report, in the order they appear in the report.
// Each row's cells are read by position: account, opportunity, amount, close date, stage, owner.
const DETAIL_COLUMNS = [
  "ACCOUNT_NAME",
  "OPPORTUNITY_NAME",
  "AMOUNT",
  "CLOSE_DATE",
  "STAGE_NAME",
  "OWNER_FULL_NAME",
];
// Zapier Tables table that receives the report rows (the table's ID).
const REPORTING_TABLE_ID = "YOUR_TABLE_ID";
// Field keys of the reporting table, as Zapier Tables names them.
const FIELD_RECORD_KEY = "new__data__f1";
const FIELD_ACCOUNT = "new__data__f2";
const FIELD_OPPORTUNITY = "new__data__f3";
const FIELD_AMOUNT = "new__data__f4";
const FIELD_CLOSE_DATE = "new__data__f5";
const FIELD_STAGE = "new__data__f6";
const FIELD_OWNER = "new__data__f7";
const FIELD_SYNCED_AT = "new__data__f8";
// Most rows processed in one run. Each row costs one lookup and one write.
const MAX_ROWS = 200;

type ReportCell = { value?: unknown };
type ReportRow = { dataCells?: ReportCell[] };
type ReportRowValues = unknown[];

function cleanText(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatRow(cells: ReportRowValues) {
  const [account, opportunity, amount, closeDate, stage, owner] = cells;
  const accountText = cleanText(account);
  const opportunityText = cleanText(opportunity);
  return {
    recordKey: `${accountText}|${opportunityText}`,
    account: accountText,
    opportunity: opportunityText,
    amount: Number(Number(amount ?? 0).toFixed(2)),
    closeDate: cleanText(closeDate).slice(0, 10),
    stage: cleanText(stage),
    owner: cleanText(owner),
  };
}

const workflow = defineDurable<unknown, unknown>(
  "create-hourly-finance-report-records-in-your-reporting-table",
  async (ctx) => {
    const syncedAt = await ctx.step("capture-synced-at", async () =>
      new Date().toISOString(),
    );

    const reportRows = await ctx.step("run-salesforce-report", async () => {
      const result = await sdk.runAction({
        appKey: "salesforce",
        actionType: "write",
        actionKey: "run_report",
        connection: "salesforce",
        inputs: {
          reportId: REPORT_ID,
          reportFormat: "TABULAR",
          includeDetails: "true",
          detailColumns: DETAIL_COLUMNS,
        },
      });
      const report = result.data[0] as {
        factMap?: { "0!T"?: { rows?: ReportRow[] } };
      };
      return (report.factMap?.["0!T"]?.rows ?? [])
        .slice(0, MAX_ROWS)
        .map((row) => (row.dataCells ?? []).map((cell) => cell.value ?? null));
    });

    if (reportRows.length === 0) {
      return { skipped: true, reason: "no-report-rows" };
    }

    let created = 0;
    let updated = 0;
    const failed: { row: number; error: string }[] = [];

    for (let index = 0; index < reportRows.length; index++) {
      const row = formatRow(reportRows[index]);

      const lookup = await ctx.step(`find-row-${index}`, async () => {
        try {
          const found = await sdk.runAction({
            appKey: "zapier-tables",
            actionType: "search",
            actionKey: "find_record",
            connection: "zapier-tables",
            inputs: {
              table_id: REPORTING_TABLE_ID,
              filter_count: "1",
              field_data_key: FIELD_RECORD_KEY,
              lookup_value: row.recordKey,
            },
          });
          const existingId = found.data[0]?.id;
          return { id: existingId ? String(existingId) : null };
        } catch (error) {
          return { id: null, error: String(error) };
        }
      });

      if ("error" in lookup) {
        failed.push({ row: index, error: lookup.error as string });
        continue;
      }

      const fields = {
        table_id: REPORTING_TABLE_ID,
        [FIELD_RECORD_KEY]: row.recordKey,
        [FIELD_ACCOUNT]: row.account,
        [FIELD_OPPORTUNITY]: row.opportunity,
        [FIELD_AMOUNT]: row.amount,
        [FIELD_CLOSE_DATE]: row.closeDate,
        [FIELD_STAGE]: row.stage,
        [FIELD_OWNER]: row.owner,
        [FIELD_SYNCED_AT]: syncedAt,
      };

      try {
        if (lookup.id) {
          await ctx.step(`update-row-${index}`, async () =>
            sdk.runAction({
              appKey: "zapier-tables",
              actionType: "write",
              actionKey: "update_record",
              connection: "zapier-tables",
              inputs: { ...fields, record_id: lookup.id },
            }),
          );
          updated++;
        } else {
          await ctx.step(`create-row-${index}`, async () =>
            sdk.runAction({
              appKey: "zapier-tables",
              actionType: "write",
              actionKey: "create_record",
              connection: "zapier-tables",
              inputs: fields,
            }),
          );
          created++;
        }
      } catch (error) {
        failed.push({ row: index, error: String(error) });
      }
    }

    return { rows: reportRows.length, created, updated, failed };
  },
);

export default workflow;
