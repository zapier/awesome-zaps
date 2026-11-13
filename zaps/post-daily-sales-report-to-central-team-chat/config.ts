// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Ask the user which channel gets the summary, then look up its ID (C…) with their Slack connection.

// Keep "no" so the summary never links or mentions any user or channel.
export const LINK_NAMES = "no";
