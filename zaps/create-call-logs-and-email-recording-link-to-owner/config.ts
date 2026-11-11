import { ask } from "zap-pack";

export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID (the long ID in the sheet's URL).",
);
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
export const OWNER_EMAIL = ask(
  "Email address that receives the recording link. Must be the connected Gmail account's own address.",
);
// Status written to every logged call.
export const COMPLETED_STATUS = "Completed";
