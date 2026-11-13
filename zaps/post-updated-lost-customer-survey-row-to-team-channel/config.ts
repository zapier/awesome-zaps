// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet is the tracker, then look up its ID (the long ID in the sheet's URL) with their Google Sheets connection.
export const SLACK_CHANNEL_ID = "REPLACE_SLACK_CHANNEL_ID"; // Ask the user which channel gets the posts, then look up its ID (C…) with their Slack connection.

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Column keys for the survey fields (COL$A = column A).
export const CUSTOMER_NAME_COLUMN = "COL$B";
export const SATISFACTION_COLUMN = "COL$C";
export const OWNER_COLUMN = "COL$D";
export const ENTRY_SOURCE_COLUMN = "COL$E";
export const VIDEO_LINK_COLUMN = "COL$F";
export const COMMENTS_COLUMN = "COL$G";
export const SURVEY_STATUS_COLUMN = "COL$I";
export const NOTIFIED_COLUMN = "COL$J";
// Survey status that qualifies a row for a notification.
export const COMPLETED_STATUS = "Completed";
// Value written to the notified column so a row is announced once.
export const NOTIFIED_VALUE = "notified";
// Name shown as the bot above the message.
export const BOT_NAME = "Lost customer survey";
