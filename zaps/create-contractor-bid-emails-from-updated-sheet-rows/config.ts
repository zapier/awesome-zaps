// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet holds the bid requests, then look up its ID with their Google Sheets connection. Also set it in the trigger's spreadsheet param.

// Worksheet (tab) ID; the first tab is "0". Also set it in the trigger's worksheet param.
export const WORKSHEET_ID = "0";
// Column holding the contractor's email address (COL$A = column A).
export const CONTRACTOR_EMAIL_COLUMN = "COL$A";
// Column holding the project reference, used in the draft subject.
export const PROJECT_REFERENCE_COLUMN = "COL$B";
// Column holding the project location, used in the draft subject.
export const LOCATION_COLUMN = "COL$C";
// Column holding the project details, shown in the draft body.
export const PROJECT_DETAILS_COLUMN = "COL$D";
// Column holding the project description, shown in the draft body.
export const DESCRIPTION_COLUMN = "COL$E";
// Column that marks a row as drafted, so it is not drafted twice.
export const DRAFTED_COLUMN = "COL$F";
// Column that records when the draft was created.
export const DRAFTED_AT_COLUMN = "COL$G";
// Value written to the drafted column.
export const DRAFTED_VALUE = "Yes";
