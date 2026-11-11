import { ask } from "zap-pack";

export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID (the long ID in the sheet's URL).",
);
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Column with the requestor's email address (the To address).
export const REQUESTOR_EMAIL_COLUMN = "COL$A";
// Column with the subject text.
export const SUBJECT_COLUMN = "COL$B";
// Column with the message fragments for the body.
export const MESSAGE_COLUMN = "COL$C";
// Column with the link to the finished files.
export const FILE_LINK_COLUMN = "COL$D";
// Column whose value marks a request as finished.
export const STATUS_COLUMN = "COL$E";
// Status value that means the request is completed.
export const COMPLETED_VALUE = "Completed";
