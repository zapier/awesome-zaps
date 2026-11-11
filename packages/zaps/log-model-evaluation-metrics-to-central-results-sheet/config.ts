import { ask } from "zap-pack";

export const TARGETS_FILE_NAME = ask(
  "Name of the canonical targets JSON file in Google Drive (the first match is used).",
);
export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID (the long ID in the sheet's URL).",
);
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
