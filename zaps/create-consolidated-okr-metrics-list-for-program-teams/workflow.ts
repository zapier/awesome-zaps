import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

import { BASE_ID, TABLE_ID } from "./config.ts";

const sdk = createZapierSdk();

const workflow = defineDurable(
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
