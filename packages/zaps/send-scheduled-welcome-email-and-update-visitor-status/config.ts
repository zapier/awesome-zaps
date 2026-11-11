import { ask } from "zap-pack";

export const TABLE_ID = ask(
  "Zapier Tables table to watch (the Table ID from the table's URL).",
);
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
