// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SLACK_CHANNEL_ID = "REPLACE_SLACK_CHANNEL_ID"; // Ask the user which channel gets the summary, then look up its ID (C…) with their Slack connection. Use the ID, not the channel name.
export const MEETINGS_TABLE_ID = "REPLACE_MEETINGS_TABLE_ID"; // Ask the user which Zapier Table holds meetings, then look up its ID with their Zapier Tables connection. It needs the columns title, date, link and action items.

// Line in the transcript that marks where the action items start.
export const ACTION_ITEMS_MARKER = "Suggested next steps";
