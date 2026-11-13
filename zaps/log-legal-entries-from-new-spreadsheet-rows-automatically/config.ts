// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const WORKBOOK_ID = "REPLACE_WORKBOOK_ID"; // Microsoft Excel workbook ID. Set it in the trigger's Workbook field too; the code does not read it.
export const WORKSHEET_ID = "REPLACE_WORKSHEET_ID"; // Worksheet ID inside the workbook. Set it in the trigger's Worksheet field too; the code does not read it.
export const EXCEL_TABLE_ID = "REPLACE_EXCEL_TABLE_ID"; // Excel table ID new rows come from. Set it in the trigger's Table field too; the code does not read it.
export const LEGAL_ENTRIES_TABLE_ID = "REPLACE_LEGAL_ENTRIES_TABLE_ID"; // Zapier Table that receives one legal entry record per row.

// Excel column headers the row is read from. Check them against the sheet's header row.
export const TITLE_COLUMN = "Title";
export const SUBMISSION_ID_COLUMN = "Submission ID";
export const NOTES_COLUMN = "Notes";
export const PRIORITY_COLUMN = "Priority";
