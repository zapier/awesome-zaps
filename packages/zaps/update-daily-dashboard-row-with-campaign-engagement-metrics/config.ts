import { ask } from "zap-pack";

// Time zone that defines "the day" for the query window and the row date (IANA name).
export const TIMEZONE = "America/New_York";
export const ANALYTICS_URL = ask(
  "Analytics endpoint that returns the day's engagement buckets; called with GET ?start=…&end=….",
);
// Dot path to the object holding the buckets in the endpoint's JSON response ("" = top level).
export const ANALYTICS_METRICS_PATH = "";
export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID (the long ID in the sheet's URL).",
);
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Column holding the row's date as YYYY-MM-DD (COL$A = column A).
export const DATE_COLUMN = "COL$A";
