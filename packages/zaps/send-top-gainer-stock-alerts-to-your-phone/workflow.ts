import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table that holds your stocks (its table ID).
const TABLE_ID = "YOUR_STOCKS_TABLE_ID";
// Field key the ticker is matched on when looking for an existing row ("f1" = first field).
const TICKER_LOOKUP_FIELD = "f1";
// Field key the ticker is written to on a new row.
const TICKER_FIELD = "new__data__f1";
// Field key the market text is saved to on a new row.
const NOTES_FIELD = "new__data__f2";
// Field key the time the ticker was added is saved to on a new row.
const TIME_FIELD = "new__data__f3";
// Most tickers handled per incoming message; any beyond this are ignored.
const MAX_TICKERS = 10;
// Search link prefix; the ticker and "+stock" are appended to it.
const SEARCH_URL_PREFIX = "https://www.google.com/search?q=";
// Instructions for the AI step that pulls ticker symbols out of the market text.
const TICKER_PROMPT =
  "Read the market text in the message. List every stock ticker symbol it mentions as uppercase symbols separated by commas, with nothing else. If there are none, return an empty answer.";

const InputSchema = z
  .object({ body: z.string().nullable().optional() })
  .loose();

// Keeps only values that look like ticker symbols (1 to 5 capital letters).
function parseTickers(text: string): string[] {
  const symbols = text
    .split(/[\s,]+/)
    .map((part) => part.trim())
    .filter((part) => /^[A-Z]{1,5}$/.test(part));
  return [...new Set(symbols)];
}

const workflow = defineDurable<unknown, unknown>(
  "send-top-gainer-stock-alerts-to-your-phone",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const message = input.body ?? "";

    const extraction = await ctx.step("extract-tickers", async () =>
      sdk.runAction({
        appKey: "ai",
        actionType: "write",
        actionKey: "get_completion",
        connection: "ai",
        inputs: {
          model_id: "premium/auto",
          authentication_id: "0",
          includeWorkflowData: "false",
          inputFields: { message },
          instructions: TICKER_PROMPT,
        },
      }),
    );

    const tickers = parseTickers(
      String(extraction.data[0]?.output ?? ""),
    ).slice(0, MAX_TICKERS);
    if (tickers.length === 0) {
      return { skipped: true, reason: "no-tickers" };
    }

    const results: { ticker: string; status: string; error?: string }[] = [];
    for (const [index, ticker] of tickers.entries()) {
      try {
        const match = await ctx.step(`find-stock-${index}`, async () =>
          sdk.runAction({
            appKey: "zapier-tables",
            actionType: "search",
            actionKey: "find_record",
            connection: "zapier-tables",
            inputs: {
              table_id: TABLE_ID,
              filter_count: "1",
              use_stored_order: false,
              field_data_key: TICKER_LOOKUP_FIELD,
              operator: "exact",
              lookup_value: ticker,
            },
          }),
        );

        if (match.data.length > 0) {
          results.push({ ticker, status: "duplicate" });
          continue;
        }

        await ctx.step(`create-stock-${index}`, async () =>
          sdk.runAction({
            appKey: "zapier-tables",
            actionType: "write",
            actionKey: "create_record",
            connection: "zapier-tables",
            inputs: {
              table_id: TABLE_ID,
              [TICKER_FIELD]: ticker,
              [NOTES_FIELD]: message,
              [TIME_FIELD]: new Date().toISOString(),
            },
          }),
        );

        const link = `${SEARCH_URL_PREFIX}${encodeURIComponent(ticker)}+stock`;
        await ctx.step(`send-sms-${index}`, async () =>
          sdk.runAction({
            appKey: "sms",
            actionType: "write",
            actionKey: "send_v2",
            connection: "sms",
            inputs: { message: `${ticker} top gainer: ${link}` },
          }),
        );

        results.push({ ticker, status: "alerted" });
      } catch (error) {
        results.push({ ticker, status: "failed", error: String(error) });
      }
    }

    const failures = results.filter(
      (result) => result.status === "failed",
    ).length;
    return { tickers, failures, results };
  },
);

export default workflow;
