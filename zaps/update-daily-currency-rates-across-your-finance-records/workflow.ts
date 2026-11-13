import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

import { NOTION_PAGE_ID, FX_API_URL } from "./config.ts";

const sdk = createZapierSdk();

// Currencies to write to that page, as ISO codes.
const TARGET_CURRENCIES = ["CAD", "ILS"];

const workflow = defineDurable(
  "update-daily-currency-rates-across-your-finance-records",
  async (ctx) => {
    const fx = await ctx.step("fetch-fx-rates", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "get",
        inputs: { url: FX_API_URL, as_json: "yes", json_key: "json" },
      }),
    );

    const payload = fx.data[0]?.json as
      { rates?: Record<string, number> } | undefined;
    const rates = payload?.rates ?? {};
    const missing = TARGET_CURRENCIES.filter(
      (code) => rates[code] === undefined,
    );
    if (missing.length === TARGET_CURRENCIES.length) {
      return { skipped: true, reason: "no-target-rates-in-response" };
    }

    const lines = TARGET_CURRENCIES.map((code) =>
      rates[code] === undefined
        ? `${code}: unavailable`
        : `${code}: ${Number(rates[code]).toFixed(4)}`,
    );

    const updated = await ctx.step("update-notion-rate-record", async () =>
      sdk.runAction({
        appKey: "notion",
        actionType: "write",
        actionKey: "update_database_item",
        connection: "notion",
        inputs: {
          page: NOTION_PAGE_ID,
          content: lines.join("\n"),
          content_format: "plain_text",
        },
      }),
    );

    return { updated, rates: lines, missing };
  },
);

export default workflow;
