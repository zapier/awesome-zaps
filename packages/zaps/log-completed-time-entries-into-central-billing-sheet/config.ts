import { ask } from "zap-pack";

export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID for the central billing sheet (the long ID in the sheet's URL).",
);
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Sheet column keys (COL$A = column A). Map these to the billing sheet's headers.
export const ENTRY_ID_COLUMN = "COL$A";
export const DATE_COLUMN = "COL$B";
export const STAFF_COLUMN = "COL$C";
export const PROJECT_COLUMN = "COL$D";
export const HOURS_COLUMN = "COL$E";
export const DESCRIPTION_COLUMN = "COL$F";
