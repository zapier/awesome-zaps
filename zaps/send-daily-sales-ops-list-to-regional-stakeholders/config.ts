// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const FOLDER_ID = "REPLACE_FOLDER_ID"; // Ask the user which Drive folder holds the worksheet, then look up its ID with their Google Drive connection.
export const WORKSHEET_TITLE = "REPLACE_WORKSHEET_TITLE"; // Ask the user for the exact title of the worksheet file to send each weekday.

// Subject line for the email.
export const SUBJECT = "Daily sales ops list";
