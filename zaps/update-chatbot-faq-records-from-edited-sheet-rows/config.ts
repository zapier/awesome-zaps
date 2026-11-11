import { ask } from "zap-pack";

export const TABLE_ID = ask(
  "Zapier Table holding the chatbot's FAQ records (the ID in the table's URL).",
);
// Sheet column holding the question text (COL$A = column A).
export const QUESTION_COLUMN = "COL$A";
// Sheet column holding the answer text.
export const ANSWER_COLUMN = "COL$B";
// Table field ID for the question; records are matched on this field.
export const QUESTION_FIELD = "f1";
// Table field ID for the answer.
export const ANSWER_FIELD = "f2";
// Table field ID for the version.
export const VERSION_FIELD = "f3";
// Table datetime field ID stamped each time the record is synced from the sheet.
export const LAST_EDITED_FIELD = "f4";
// Table field ID recording which sheet row the record came from.
export const SHEET_ROW_FIELD = "f5";
