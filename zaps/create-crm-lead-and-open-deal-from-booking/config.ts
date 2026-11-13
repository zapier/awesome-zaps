// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const INCOMING_STAGE_ID = "REPLACE_INCOMING_STAGE_ID"; // Ask the user which Pipedrive stage new deals open in, then look up its numeric ID with their Pipedrive connection.
export const OWNER_ID = "REPLACE_OWNER_ID"; // Ask the user which Pipedrive user owns new deals, then look up their numeric ID with their Pipedrive connection.

// Only bookings whose event name contains this text (case-insensitive) continue. Set to "" to accept every event type.
export const EVENT_NAME_MATCH = "coaching session";
