// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which spreadsheet is the A/B test log, then look up its ID with their Google Sheets connection. It is the long ID in the sheet's URL.
export const SLACK_CHANNEL_ID = "REPLACE_SLACK_CHANNEL_ID"; // Ask the user which channel gets the posts, then look up its ID (C…) with their Slack connection. It is the channel's ID, such as C0123456789.

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Column holding the test name (COL$A = column A).
export const TEST_NAME_COLUMN = "COL$A";
// Column holding the first variant's description.
export const VARIANT_A_COLUMN = "COL$B";
// Column holding the second variant's description.
export const VARIANT_B_COLUMN = "COL$C";
// Column holding the test URL; also used to skip repeat posts for the same test.
export const TEST_URL_COLUMN = "COL$D";
// Column holding the reporter / user who logged the test.
export const REPORTER_COLUMN = "COL$E";
// Column holding an optional screenshot URL.
export const SCREENSHOT_COLUMN = "COL$F";
