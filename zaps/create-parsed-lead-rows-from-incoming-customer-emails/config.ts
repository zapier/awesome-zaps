// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Google Sheets spreadsheet ID (the long ID in the sheet's URL).

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Google Drive location of the spreadsheet; "" is My Drive.
export const DRIVE_ID = "";
// Case-insensitive pattern a message's subject or body preview must match to be logged.
export const LEAD_PATTERN = "lead|inquiry|quote request";
// Column for the date the message was received (COL$A = column A).
export const DATE_COLUMN = "COL$A";
// Column for the short description of the lead.
export const DESCRIPTION_COLUMN = "COL$B";
// Column for the customer note and first token from the message.
export const DETAILS_COLUMN = "COL$C";
// Column for the source identifier (the Outlook message ID), also used to match duplicates.
export const SOURCE_COLUMN = "COL$D";
