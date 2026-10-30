import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

const sdk = createZapierSdk();

// Airtable base ID (starts with "app") that holds the OKR metrics table.
const BASE_ID = "YOUR_BASE_ID";
// Airtable table ID (starts with "tbl") of the OKR metrics table.
const TABLE_ID = "YOUR_TABLE_ID";

const workflow = defineDurable<unknown, unknown>(
  "create-consolidated-okr-metrics-list-for-program-teams",
  async (ctx) => {
    const records = await ctx.step("list-okr-metric-records", async () =>
      sdk.runAction({
        appKey: "airtable",
        actionType: "search",
        actionKey: "get_all_records",
        connection: "airtable",
        inputs: {
          applicationId: BASE_ID,
          tableId: TABLE_ID,
        },
      }),
    );

    const recordIds = records.data
      .map((record) => String(record.id ?? "").trim())
      .filter((id) => id.length > 0);
    const uniqueIds = [...new Set(recordIds)];

    if (uniqueIds.length === 0) {
      return { skipped: true, reason: "no-records", count: 0, recordIds: "" };
    }

    return {
      count: uniqueIds.length,
      recordIds: uniqueIds.join(","),
    };
  },
);

export default workflow;
