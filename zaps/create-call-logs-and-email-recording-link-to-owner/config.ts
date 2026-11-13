// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet is the call log, then look up its ID (the long ID in the sheet's URL) with their Google Sheets connection.
export const OWNER_EMAIL = "REPLACE_OWNER_EMAIL"; // Ask the user which email address gets the recording link. It must be the connected Gmail account's own address.

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Status written to every logged call.
export const COMPLETED_STATUS = "Completed";
