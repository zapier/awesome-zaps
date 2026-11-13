// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const BOOKINGS_CHANNEL_ID = "REPLACE_BOOKINGS_CHANNEL_ID"; // Ask the user which Slack channel is the bookings channel, then look up its ID (starts with C, not the name) with their Slack connection.

// Bot name shown above each alert.
export const BOT_NAME = "Live Chat Inquiries";
// Bot icon: an emoji or image URL.
export const BOT_ICON = ":speech_balloon:";
