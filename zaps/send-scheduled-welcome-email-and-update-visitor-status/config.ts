// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which table holds the visitors, then look up its ID (the Table ID in the table's URL) with their Zapier Tables connection.

// Column keys in the table, in the order the columns were added: f1 is the first column.
export const EMAIL_FIELD = "f1";
export const NAME_FIELD = "f2";
export const MILESTONE_FIELD = "f3";
export const STAGE_FIELD = "f4";
export const SENT_AT_FIELD = "f5";
// Milestone value that starts the welcome sequence.
export const MILESTONE_VALUE = "Signed up";
// Stage the record moves to after the welcome email is sent.
export const NEXT_STAGE = "Welcome sent";
// Email subject. {name} is replaced with the record's name.
export const EMAIL_SUBJECT = "Welcome, {name}!";
// Sender name shown in the email.
export const FROM_NAME = "Customer Success";
