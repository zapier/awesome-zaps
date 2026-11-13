// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Google Sheets spreadsheet ID (the long ID in the sheet's URL).

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Column holding the attendee identifier to match on (COL$A = column A).
export const ATTENDEE_ID_COLUMN = "COL$A";
// Column for the attendance status, overwritten with NO_SHOW_VALUE.
export const STATUS_COLUMN = "COL$C";
// Column for the time the row was marked.
export const LAST_UPDATED_COLUMN = "COL$D";
// Column for the note about where the update came from.
export const COMMENTS_COLUMN = "COL$E";
// Status written to the matching row.
export const NO_SHOW_VALUE = "No-show";
