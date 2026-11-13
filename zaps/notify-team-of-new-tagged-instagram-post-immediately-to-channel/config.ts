// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Slack channel ID to post alerts into (for example C0123456).

// Bot name shown above each alert.
export const BOT_NAME = "Instagram Tags";
// Bot icon: an emoji such as ":camera:" or an image URL.
export const BOT_ICON = ":camera:";
// Mention markup prepended to the alert when MENTION_ENABLED is true.
export const MENTION_TEXT = "<!subteam^YOUR_GROUP_ID> ";
