// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const INTAKE_SPREADSHEET_ID = "REPLACE_INTAKE_SPREADSHEET_ID"; // Ask the user which spreadsheet holds the design requests, then look up its ID (the long ID in the sheet's URL) with their Google Sheets connection.
export const DIGEST_RECIPIENT = "REPLACE_DIGEST_RECIPIENT"; // Ask the user which email address gets the digest. Must be the connected Gmail account itself.

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
