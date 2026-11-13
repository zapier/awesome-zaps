// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const ANALYTICS_URL = "REPLACE_ANALYTICS_URL"; // Ask the user for the analytics endpoint that returns the day's engagement buckets; it is called with GET ?start=…&end=….
export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet is the dashboard, then look up its ID (the long ID in the sheet's URL) with their Google Sheets connection.

// Time zone that defines "the day" for the query window and the row date (IANA name).
export const TIMEZONE = "America/New_York";
// Dot path to the object holding the buckets in the endpoint's JSON response ("" = top level).
export const ANALYTICS_METRICS_PATH = "";
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Column holding the row's date as YYYY-MM-DD (COL$A = column A).
export const DATE_COLUMN = "COL$A";
