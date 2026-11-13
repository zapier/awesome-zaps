// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet is the lesson log, then look up its ID (the long ID in the sheet's URL) with their Google Sheets connection. The calendar is set on the trigger, not here.

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Column holding the calendar event ID the row is matched on (COL$A = column A).
export const EVENT_ID_COLUMN = "COL$A";
// Column for the session date, taken from the event's start.
export const DATE_COLUMN = "COL$B";
// Column for the session duration in minutes.
export const DURATION_COLUMN = "COL$C";
// Column for the session summary, taken from the event title.
export const SUMMARY_COLUMN = "COL$D";
// Column for the session notes, taken from the event description.
export const NOTES_COLUMN = "COL$E";
