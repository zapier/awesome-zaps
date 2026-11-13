// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet is the recruiting log, then look up its ID (the long ID in the sheet's URL) with their Google Sheets connection.

// Alerts are sent from the connected Outlook account to each address listed here.
export const RECRUITER_EMAILS = ["REPLACE_RECRUITER_EMAIL"]; // Ask the user which recruiter addresses get each alert, one entry per address.

// Worksheet (tab) ID the lead rows are appended to; the first tab is "0".
export const WORKSHEET_ID = "0";
