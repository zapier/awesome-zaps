// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which spreadsheet is the central billing sheet, then look up its ID (the long ID in its URL) with their Google Sheets connection.

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Sheet column keys (COL$A = column A). Map these to the billing sheet's headers.
export const ENTRY_ID_COLUMN = "COL$A";
export const DATE_COLUMN = "COL$B";
export const STAFF_COLUMN = "COL$C";
export const PROJECT_COLUMN = "COL$D";
export const HOURS_COLUMN = "COL$E";
export const DESCRIPTION_COLUMN = "COL$F";
