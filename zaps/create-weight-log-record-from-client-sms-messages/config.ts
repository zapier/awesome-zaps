// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const QUO_FROM_PHONE_NUMBER_ID = "REPLACE_QUO_FROM_PHONE_NUMBER_ID"; // Look up with the user's Quo connection the ID of the phone number clients text; it is the "From" line of the confirmation SMS.
export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which Zapier Table is the central weight log, then look up its ID with their Zapier Tables connection.

// Acknowledgement SMS; {weight} is replaced with the logged value.
export const ACK_TEMPLATE = "Thanks, logged your weight: {weight}.";
