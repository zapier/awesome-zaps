import { ask } from "zap-pack";

export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID of the A/B test log (the long ID in the sheet's URL).",
);
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
export const SLACK_CHANNEL_ID = ask(
  'Slack channel ID to post to (from the channel\'s details, e.g. "C0123456789").',
);
