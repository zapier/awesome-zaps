// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const CALLS_TABLE_ID = "REPLACE_CALLS_TABLE_ID"; // Zapier Tables table of temporary call records. Its ID is in the table's URL.
export const ALERT_EMAIL = "REPLACE_ALERT_EMAIL"; // Address that receives an alert when a call has no ticket. Use an address you read.

// Column in the Calls table that holds the normalized caller phone number.
export const PHONE_FIELD = "phone";
// Column in the Calls table that holds the HubSpot ticket ID for the call.
export const TICKET_REFERENCE_FIELD = "ticket_reference";
