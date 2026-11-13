// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const ON_CALL_CHAT_ID = "REPLACE_ON_CALL_CHAT_ID"; // Ask the user which Telegram chat or group is on call, then use its chat ID (for example "-1001234567890" or "@your_channel"). The bot must be a member of the chat.

// Telegram username to mention when MENTION_ON_CALL is true.
export const ON_CALL_MENTION = "REPLACE_ON_CALL_MENTION"; // Ask the user which on-call person to mention, as their Telegram username including the @. Only used when MENTION_ON_CALL is true.
