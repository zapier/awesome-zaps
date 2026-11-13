// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Google Sheets spreadsheet ID of the staff roster (the long ID in the sheet's URL).
export const TO_ADDRESS = "REPLACE_TO_ADDRESS"; // Address in the To field. Roster addresses go in BCC so recipients can't see each other.

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Roster columns: name, email, policy file link (A:C).
export const ROSTER_RANGE = "A:C";
// Column key of the email column (COL$A = column A, COL$B = column B).
export const EMAIL_COLUMN = "COL$B";
// Column key of the policy file-link column.
export const FILE_LINK_COLUMN = "COL$C";
// Prefix added to the subject line; leave empty for production.
export const SUBJECT_PREFIX = "";
// Subject of the reminder email.
export const SUBJECT = "Monthly policy compliance reminder";
