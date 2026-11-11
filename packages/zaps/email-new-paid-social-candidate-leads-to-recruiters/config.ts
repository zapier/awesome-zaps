import { ask } from "zap-pack";

export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID (the long ID in the sheet's URL).",
);
// Worksheet (tab) ID the lead rows are appended to; the first tab is "0".
export const WORKSHEET_ID = "0";
