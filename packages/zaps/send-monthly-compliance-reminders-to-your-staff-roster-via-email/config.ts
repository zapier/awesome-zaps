import { ask } from "zap-pack";

export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID of the staff roster (the long ID in the sheet's URL).",
);
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Roster columns: name, email, policy file link (A:C).
export const ROSTER_RANGE = "A:C";
// Column key of the email column (COL$A = column A, COL$B = column B).
export const EMAIL_COLUMN = "COL$B";
// Column key of the policy file-link column.
export const FILE_LINK_COLUMN = "COL$C";
export const TO_ADDRESS = ask(
  "Address in the To field. Roster addresses go in BCC so recipients can't see each other.",
);
// Prefix added to the subject line; leave empty for production.
export const SUBJECT_PREFIX = "";
// Subject of the reminder email.
export const SUBJECT = "Monthly policy compliance reminder";
