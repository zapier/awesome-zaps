// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Ask the user which channel gets the alerts, then look up its ID (for example C0123456) with their Slack connection.

// Bot name shown above each alert.
export const BOT_NAME = "Instagram Tags";
// Bot icon: an emoji such as ":camera:" or an image URL.
export const BOT_ICON = ":camera:";
// Mention markup prepended to the alert when MENTION_ENABLED is true.
export const MENTION_TEXT = "<!subteam^REPLACE_GROUP_ID> "; // Ask the user which Slack user group to mention, then look up its ID (S…) with their Slack connection. Used only when MENTION_ENABLED is true.
