// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Ask the user which channel gets the alert posts, then look up its ID (C…) with their Slack connection. The ID, not the name.

// Heading placed before each alert's subject.
export const ALERT_HEADER = "Model monitoring alert";
// Text placed before each post, e.g. "<!channel> " to ping the channel. Empty means nobody is pinged.
export const MENTION_PREFIX = "";
