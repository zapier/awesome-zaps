// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet is the central churn tracker, then look up its ID (the long ID in its URL) with their Google Sheets connection.

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Column for the employee's full name (COL$A = column A).
export const NAME_COLUMN = "COL$A";
// Column for the termination date, written as DD/MM/YYYY.
export const TERMINATION_DATE_COLUMN = "COL$B";
// Column for the hire date, written as DD/MM/YYYY.
export const HIRE_DATE_COLUMN = "COL$C";
// Column for the department name.
export const DEPARTMENT_COLUMN = "COL$D";
// Column for weekly working hours. Week and month columns stay as sheet formulas.
export const HOURS_COLUMN = "COL$E";
