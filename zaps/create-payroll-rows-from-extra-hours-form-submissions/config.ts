// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const FORM_ID = "REPLACE_FORM_ID"; // Ask the user which Typeform form is the extra-hours form, then look up its ID with their Typeform connection. Also set as the trigger's formId.
export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet holds the payroll rows, then look up its ID (the long ID in the sheet's URL) with their Google Sheets connection.
export const PAYROLL_EMAIL = "REPLACE_PAYROLL_EMAIL"; // Ask the user which email address gets the payroll clerk notification.
export const WORKER_NAME_REF = "REPLACE_WORKER_NAME_REF"; // Ask the user which form question asks for the worker's name, then look up its question ref in FORM_ID with their Typeform connection.
export const DATE_REF = "REPLACE_DATE_REF"; // Ask the user which form question asks for the date, then look up its question ref in FORM_ID with their Typeform connection.
export const HOURS_REF = "REPLACE_HOURS_REF"; // Ask the user which form question asks for the hours, then look up its question ref in FORM_ID with their Typeform connection.
export const NOTES_REF = "REPLACE_NOTES_REF"; // Ask the user which form question asks for the notes, then look up its question ref in FORM_ID with their Typeform connection.

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Sheet columns (COL$A = column A).
export const SUBMISSION_ID_COLUMN = "COL$A";
export const NAME_COLUMN = "COL$B";
export const DATE_COLUMN = "COL$C";
export const HOURS_COLUMN = "COL$D";
export const DESCRIPTION_COLUMN = "COL$E";
