import { ask } from "zap-pack";

export const SPREADSHEET_ID = ask(
  "The calendar is set in the trigger config (`calendarid` on Google Calendar's \"New or Updated Event\" trigger), not in this file. Google Sheets spreadsheet ID (the long ID in the sheet's URL).",
);
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
