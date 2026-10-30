import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

const sdk = createZapierSdk();

// Zapier Tables table ID holding the jobs (from the table's URL).
const TABLE_ID = "YOUR_TABLE_ID";
// Table field key for the closed date; each day in the period is searched on it.
const CLOSED_DATE_FIELD = "YOUR_CLOSED_DATE_FIELD_KEY";
// Table field key that receives the search value. Not yet verified against a real table.
const LOOKUP_VALUE_FIELD = "YOUR_LOOKUP_VALUE_FIELD_KEY";
// Notion data source ID of the finance report database.
const NOTION_DATA_SOURCE_ID = "YOUR_NOTION_DATA_SOURCE_ID";
// Number of full days before the run date to count (7 = the previous week).
const LOOKBACK_DAYS = 7;

function formatMMDDYY(date: Date): string {
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const yy = String(date.getUTCFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

const workflow = defineDurable<unknown, unknown>(
  "create-weekly-job-invoicing-performance-report-for-finance",
  async (ctx) => {
    const reportDate = await ctx.step("capture-report-date", async () =>
      new Date().toISOString().slice(0, 10),
    );

    const anchor = new Date(`${reportDate}T00:00:00Z`);
    const days = Array.from({ length: LOOKBACK_DAYS }, (_, i) => {
      const day = new Date(anchor);
      day.setUTCDate(day.getUTCDate() - (i + 1));
      return formatMMDDYY(day);
    });
    const periodStart = days[days.length - 1];
    const periodEnd = days[0];

    const dayResults = await Promise.all(
      days.map((day, index) =>
        ctx.step(`find-closed-jobs-${index}`, async () => {
          try {
            const result = await sdk.runAction({
              appKey: "zapier-tables",
              actionType: "search",
              actionKey: "find_record",
              connection: "zapier-tables",
              inputs: {
                table_id: TABLE_ID,
                filter_count: "1",
                use_stored_order: false,
                field_data_key: CLOSED_DATE_FIELD,
                [LOOKUP_VALUE_FIELD]: day,
              },
            });
            return { day, recordIds: result.data.map((row) => row.record_id) };
          } catch (error) {
            return { day, failed: true, reason: String(error) };
          }
        }),
      ),
    );

    const closedCount = dayResults.reduce(
      (total, result) =>
        total + ("recordIds" in result ? result.recordIds.length : 0),
      0,
    );
    const failedDays = dayResults
      .filter((result) => "failed" in result)
      .map((result) => result.day);

    const summary = `Closed jobs ${periodStart} to ${periodEnd}: ${closedCount}. Failed day lookups: ${failedDays.length ? failedDays.join(", ") : "none"}.`;

    const report = await ctx.step("create-finance-report-item", async () =>
      sdk.runAction({
        appKey: "notion",
        actionType: "write",
        actionKey: "create_database_item",
        connection: "notion",
        inputs: {
          datasource: NOTION_DATA_SOURCE_ID,
          content: summary,
          content_format: "plain_text",
        },
      }),
    );

    return {
      reportDate,
      periodStart,
      periodEnd,
      closedCount,
      failedDays,
      created: report.data[0] ?? null,
    };
  },
);

export default workflow;
