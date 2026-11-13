// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const DELAY_STAGE_ID = "REPLACE_DELAY_STAGE_ID"; // Ask the user which Pipedrive stage is the document-delay stage, then look up its ID with their Pipedrive connection. Deals moving into any other stage are skipped.
export const DELAY_LOG_TABLE_ID = "REPLACE_DELAY_LOG_TABLE_ID"; // Ask the user which Zapier Table holds the delay log, then look up its ID with their Zapier Tables connection.

// Value written to the Triage status column of each new row.
export const INITIAL_TRIAGE_STATUS = "Open";
