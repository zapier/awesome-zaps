import { ask } from "zap-pack";

export const NOTION_DATA_SOURCE_ID = ask(
  "Notion data source ID of the release tracker database the trigger watches.",
);
export const SLACK_CHANNEL = ask(
  "Slack channel ID that receives the announcements.",
);
// Display name and icon for the posting bot.
export const BOT_USERNAME = "Release Bot";
export const BOT_ICON = ":rocket:";
// Notion property names read from each release item.
export const TITLE_FIELD = "Name";
export const STATUS_FIELD = "Status";
export const DATE_FIELD = "Release Date";
export const AUDIENCE_FIELD = "Audience";
export const URL_FIELD = "URL";
