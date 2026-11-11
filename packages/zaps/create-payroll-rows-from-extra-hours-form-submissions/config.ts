import { ask } from "zap-pack";

export const FORM_ID = ask(
  "Typeform form ID of the extra-hours form (also set as the trigger's formId).",
);
export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID (the long ID in the sheet's URL).",
);
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
export const PAYROLL_EMAIL = ask(
  "Email address the payroll clerk notification is sent to.",
);
export const WORKER_NAME_REF = ask(
  "Typeform question refs for the form fields (replace with the refs in your form).",
);
export const DATE_REF = ask("DATE_REF");
export const HOURS_REF = ask("HOURS_REF");
export const NOTES_REF = ask("NOTES_REF");
// Sheet columns (COL$A = column A).
export const SUBMISSION_ID_COLUMN = "COL$A";
export const NAME_COLUMN = "COL$B";
export const DATE_COLUMN = "COL$C";
export const HOURS_COLUMN = "COL$D";
export const DESCRIPTION_COLUMN = "COL$E";
