// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const QUO_FROM_PHONE_NUMBER_ID = "REPLACE_QUO_FROM_PHONE_NUMBER_ID"; // Quo phone number ID the acknowledgement SMS is sent from (the "From" line).
export const TABLE_ID = "REPLACE_TABLE_ID"; // Zapier Table ID of the central weight log (the table the rows are added to).

// Acknowledgement SMS; {weight} is replaced with the logged value.
export const ACK_TEMPLATE = "Thanks, logged your weight: {weight}.";
