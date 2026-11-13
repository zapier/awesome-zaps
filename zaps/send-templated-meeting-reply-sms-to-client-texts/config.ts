// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const BUSINESS_PHONE_NUMBER_ID = "REPLACE_BUSINESS_PHONE_NUMBER_ID"; // Look up with the user's Quo connection the phone number replies are sent from (their business number), using its ID from Quo's "List Phone Numbers" action.
export const TEMPLATES_TABLE_ID = "REPLACE_TEMPLATES_TABLE_ID"; // Ask the user which Zapier Table holds the reply templates, then look up its ID with their Zapier Tables connection. It needs identifier (the reply code, e.g. "1") and body (the SMS text) fields.

// Sent instead when no template matches a qualifying reply.
export const FALLBACK_REPLY = "Thanks for your reply. We'll follow up shortly.";
