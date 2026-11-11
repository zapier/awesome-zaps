import { ask } from "zap-pack";

export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID (the long ID in the sheet's URL) holding the case log.",
);
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Column keys (COL$A = column A) for each field written to the log.
export const MESSAGE_ID_COLUMN = "COL$A";
export const THREAD_ID_COLUMN = "COL$B";
export const SENDER_NAME_COLUMN = "COL$C";
export const SENDER_EMAIL_COLUMN = "COL$D";
export const SUBJECT_COLUMN = "COL$E";
export const SUMMARY_COLUMN = "COL$F";
export const REFERENCE_COLUMN = "COL$G";
export const HAS_ATTACHMENTS_COLUMN = "COL$H";
export const RECEIVED_AT_COLUMN = "COL$I";
export const LOGGED_AT_COLUMN = "COL$J";
