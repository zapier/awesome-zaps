// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const WORKBOOK_ID = "REPLACE_WORKBOOK_ID"; // Ask the user which Excel workbook holds the intake table, then look up its ID with their Microsoft Excel connection. Also set it as the trigger's Workbook field; the code does not read it.
export const WORKSHEET_ID = "REPLACE_WORKSHEET_ID"; // Look up the worksheet inside that workbook with the user's Microsoft Excel connection. Also set it as the trigger's Worksheet field; the code does not read it.
export const EXCEL_TABLE_ID = "REPLACE_EXCEL_TABLE_ID"; // Look up the table on that worksheet that new rows come from, with the user's Microsoft Excel connection. Also set it as the trigger's Table field; the code does not read it.
export const LEGAL_ENTRIES_TABLE_ID = "REPLACE_LEGAL_ENTRIES_TABLE_ID"; // Ask the user which Zapier Table receives the legal entries, then look up its ID with their Zapier Tables connection.

// Excel column headers the row is read from. Check them against the sheet's header row.
export const TITLE_COLUMN = "Title";
export const SUBMISSION_ID_COLUMN = "Submission ID";
export const NOTES_COLUMN = "Notes";
export const PRIORITY_COLUMN = "Priority";
