// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const NOTION_PAGE_ID = "REPLACE_NOTION_PAGE_ID"; // Ask the user which Notion page (database item) holds the daily rates, then look up its ID with their Notion connection.

// Free FX API that returns every rate for one base currency. Swap for your provider.
export const FX_API_URL = "https://open.er-api.com/v6/latest/USD";
