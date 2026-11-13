// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const BUSINESS_PHONE_NUMBER_ID = "REPLACE_BUSINESS_PHONE_NUMBER_ID"; // Quo phone number that replies are sent from (your business number). Find its ID with Quo's "List Phone Numbers" action.
export const TEMPLATES_TABLE_ID = "REPLACE_TEMPLATES_TABLE_ID"; // Zapier Table with the reply templates. Fields: identifier (the reply code, e.g. "1") and body (the SMS text).

// Sent instead when no template matches a qualifying reply.
export const FALLBACK_REPLY = "Thanks for your reply. We'll follow up shortly.";
