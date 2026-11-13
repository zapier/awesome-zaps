// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet is the vendor alert tracker, then look up its ID (the long ID in the sheet's URL) with their Google Sheets connection.
export const DEFAULT_RECIPIENTS = ["REPLACE_CRISIS_TEAM_EMAIL"]; // Ask the user which crisis team inbox gets alerts for rows with no recipients of their own; one address per list entry.

// Worksheet (tab) ID the trigger watches; the first tab is "0".
export const WORKSHEET_ID = "0";
// Column holding the vendor name (COL$A = column A).
export const VENDOR_COLUMN = "COL$A";
// Column holding the alert title, used as the email subject.
export const TITLE_COLUMN = "COL$B";
// Column holding the short summary, used in the subject and body.
export const SUMMARY_COLUMN = "COL$C";
// Column holding the longer details, excerpted in the body.
export const DETAILS_COLUMN = "COL$D";
// Column that flags a row as an alert.
export const ALERT_COLUMN = "COL$E";
// Column holding a per-row recipient list (comma or semicolon separated); blank uses DEFAULT_RECIPIENTS.
export const RECIPIENTS_COLUMN = "COL$F";
