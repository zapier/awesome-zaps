import { ask } from "zap-pack";

export const CALENDAR_ID = ask(
  "Google Calendar the trigger watches (the calendar's email or ID). Set the same value in the trigger's Calendar setting. The code does not read it.",
);
export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID (the long ID in the sheet's URL).",
);
export const WORKSHEET_ID = ask(
  'Worksheet (tab) ID for the meeting audit rows. Use a dedicated tab; the first tab is "0".',
);
// Column for the calendar event ID, used to match events later (COL$A = column A).
export const EVENT_ID_COLUMN = "COL$A";
// Column for the event title.
export const TITLE_COLUMN = "COL$B";
// Column for the organizer's email.
export const ORGANIZER_COLUMN = "COL$C";
// Column for the event start time.
export const START_COLUMN = "COL$D";
// Column for the attendee emails, as one comma-separated string.
export const ATTENDEES_COLUMN = "COL$E";
// Column for when the event was created.
export const CREATED_COLUMN = "COL$F";
// Column for when the event was last updated.
export const UPDATED_COLUMN = "COL$G";
