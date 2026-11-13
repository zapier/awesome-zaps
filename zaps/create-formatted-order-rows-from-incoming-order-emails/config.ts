// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet holds the orders, then look up its ID (the long ID in its URL) with their Google Sheets connection.

// Gmail search string for order confirmation emails (Gmail search syntax).
export const GMAIL_QUERY = 'subject:"order confirmation" in:inbox';
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
