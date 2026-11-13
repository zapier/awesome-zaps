// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const FORM_ID = "REPLACE_FORM_ID"; // Typeform form ID of the extra-hours form (also set as the trigger's formId).
export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Google Sheets spreadsheet ID (the long ID in the sheet's URL).
export const PAYROLL_EMAIL = "REPLACE_PAYROLL_EMAIL"; // Email address the payroll clerk notification is sent to.
export const WORKER_NAME_REF = "REPLACE_WORKER_NAME_REF"; // Typeform question refs for the form fields (replace with the refs in your form).
export const DATE_REF = "REPLACE_DATE_REF"; // DATE_REF
export const HOURS_REF = "REPLACE_HOURS_REF"; // HOURS_REF
export const NOTES_REF = "REPLACE_NOTES_REF"; // NOTES_REF

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Sheet columns (COL$A = column A).
export const SUBMISSION_ID_COLUMN = "COL$A";
export const NAME_COLUMN = "COL$B";
export const DATE_COLUMN = "COL$C";
export const HOURS_COLUMN = "COL$D";
export const DESCRIPTION_COLUMN = "COL$E";
