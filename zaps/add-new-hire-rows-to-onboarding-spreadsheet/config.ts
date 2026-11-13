// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet is the onboarding tracker, then look up its ID (the long ID in the sheet's URL) with their Google Sheets connection.

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Column for the start date from the accepted offer (COL$A = column A).
export const START_DATE_COLUMN = "COL$A";
// Column for the job title.
export const TITLE_COLUMN = "COL$B";
// Column for the new hire's name.
export const NAME_COLUMN = "COL$C";
// Column for the new hire's primary email.
export const CONTACT_EMAIL_COLUMN = "COL$D";
// Column for the hiring manager's name.
export const MANAGER_NAME_COLUMN = "COL$E";
// Column for the hiring manager's email.
export const MANAGER_EMAIL_COLUMN = "COL$F";
// Hiring team role treated as the manager; the first team member is used when nobody has it.
export const HIRING_MANAGER_ROLE = "Hiring Manager";
