// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Slack channel ID the summary is posted to (open the channel in Slack, then copy its ID).

// Keep "no" so the summary never links or mentions any user or channel.
export const LINK_NAMES = "no";
