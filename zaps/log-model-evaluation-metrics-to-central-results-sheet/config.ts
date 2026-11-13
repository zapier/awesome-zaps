// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TARGETS_FILE_NAME = "REPLACE_TARGETS_FILE_NAME"; // Ask the user which Drive file holds the targets, then look up its exact name with their Google Drive connection. The first match is used.
export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet is the central results sheet, then look up its ID (the long ID in the sheet's URL) with their Google Sheets connection.

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Sheet columns for each recorded field.
export const BATCH_ID_COLUMN = "COL$A";
export const SUBMITTED_AT_COLUMN = "COL$B";
export const WORKSHOP_COLUMN = "COL$C";
export const TEAM_COLUMN = "COL$D";
export const TOTAL_RMSE_COLUMN = "COL$E";
export const HIGH_ERROR_RMSE_COLUMN = "COL$F";
export const PROFIT_ESTIMATE_COLUMN = "COL$G";
