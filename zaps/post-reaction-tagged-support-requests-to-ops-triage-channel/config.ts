// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TRIAGE_CHANNEL = "REPLACE_TRIAGE_CHANNEL"; // Ask the user which Slack channel gets the triage posts, then look up its ID with their Slack connection. The ID starts with C.
export const SOURCE_CHANNEL = "REPLACE_SOURCE_CHANNEL"; // Ask the user which Slack channel the support reaction is watched in, then look up its ID with their Slack connection. The trigger's Channel ID takes the same value.

// Reaction name that marks a message as a support request, without colons.
export const SUPPORT_REACTION = "ticket";
// Bot name shown above each triage message.
export const BOT_NAME = "Support Triage";
// Bot icon: a workspace emoji or an image URL.
export const BOT_ICON = ":ticket:";
