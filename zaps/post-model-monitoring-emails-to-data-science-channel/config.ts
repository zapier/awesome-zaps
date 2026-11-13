// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Slack channel ID that receives the alert posts (the channel's ID, not its name).

// Heading placed before each alert's subject.
export const ALERT_HEADER = "Model monitoring alert";
// Text placed before each post, e.g. "<!channel> " to ping the channel. Empty means nobody is pinged.
export const MENTION_PREFIX = "";
