// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which Zapier Table holds the company engagement counts, then look up its ID with their Zapier Tables connection. It is the tracking table, with Company ID and Engagement Count columns.

// Field key of the Company ID column. Matched on when looking for a company's row.
export const COMPANY_ID_FIELD = "data__f1";
// Field key of the Engagement Count column (a number field).
export const ENGAGEMENT_COUNT_FIELD = "data__f2";
// How much each engagement adds to a company's count. Default is 1 per event.
export const INCREMENT_AMOUNT = "1";
