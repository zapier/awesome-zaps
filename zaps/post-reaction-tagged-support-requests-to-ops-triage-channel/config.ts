// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TRIAGE_CHANNEL = "REPLACE_TRIAGE_CHANNEL"; // Slack channel ID where triage messages are posted (the channel's ID, starting with C).
export const SOURCE_CHANNEL = "REPLACE_SOURCE_CHANNEL"; // Slack channel ID the support reaction is watched in. Set the trigger's Channel ID to the same value.

// Reaction name that marks a message as a support request, without colons.
export const SUPPORT_REACTION = "ticket";
// Bot name shown above each triage message.
export const BOT_NAME = "Support Triage";
// Bot icon: a workspace emoji or an image URL.
export const BOT_ICON = ":ticket:";
