import { ask } from "zap-pack";

export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID (the long ID in the sheet's URL).",
);
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
export const SLACK_CHANNEL_ID = ask(
  "Slack channel ID to post into (starts with C). Use the channel your team reads.",
);
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
