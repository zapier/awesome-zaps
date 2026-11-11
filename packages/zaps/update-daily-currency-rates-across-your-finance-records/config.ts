import { ask } from "zap-pack";

export const NOTION_PAGE_ID = ask(
  "Notion page (database item) that holds the daily rates. Replace with your page ID.",
);
// Free FX API that returns every rate for one base currency. Swap for your provider.
export const FX_API_URL = "https://open.er-api.com/v6/latest/USD";
