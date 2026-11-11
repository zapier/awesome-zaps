import { ask } from "zap-pack";

export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID (the long ID in the sheet's URL).",
);
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Column holding the client identifier to match on (COL$A = column A).
export const CLIENT_UUID_COLUMN = "COL$A";
// Column for the flow the update came from.
export const FLOW_NAME_COLUMN = "COL$B";
// Column for the subscription properties, joined into one line.
export const SUBSCRIPTION_COLUMN = "COL$C";
// Column for the cancellation answers, formatted as "question: answer | ...".
export const ANSWERS_COLUMN = "COL$D";
// Column for the time the row was last updated.
export const UPDATED_AT_COLUMN = "COL$E";
