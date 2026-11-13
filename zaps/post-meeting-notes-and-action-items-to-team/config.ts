// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SLACK_CHANNEL_ID = "REPLACE_SLACK_CHANNEL_ID"; // Slack channel ID to post the summary to (the channel's ID, not its name).
export const MEETINGS_TABLE_ID = "REPLACE_MEETINGS_TABLE_ID"; // Zapier Tables table with one row per meeting (columns: title, date, link, action items).

// Line in the transcript that marks where the action items start.
export const ACTION_ITEMS_MARKER = "Suggested next steps";
