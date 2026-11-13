// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Ask the user which channel receives the failure alerts, then look up its ID (C…) with their Slack connection.

// Text placed before each alert, e.g. "<!channel> " to ping the channel. Leave empty for no mention.
export const MENTION_PREFIX = "";
