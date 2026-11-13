// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const NOTION_DATA_SOURCE_ID = "REPLACE_NOTION_DATA_SOURCE_ID"; // Ask the user which Notion database is the release tracker, then look up its data source ID with their Notion connection. The trigger watches this data source.
export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Ask the user which channel is the GTM team channel, then look up its ID (C…) with their Slack connection. Announcements are posted here.

// Display name and icon for the posting bot.
export const BOT_USERNAME = "Release Bot";
export const BOT_ICON = ":rocket:";
// Notion property names read from each release item.
export const TITLE_FIELD = "Name";
export const STATUS_FIELD = "Status";
export const DATE_FIELD = "Release Date";
export const AUDIENCE_FIELD = "Audience";
export const URL_FIELD = "URL";
