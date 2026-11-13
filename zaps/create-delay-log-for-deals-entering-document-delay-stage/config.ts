// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const DELAY_STAGE_ID = "REPLACE_DELAY_STAGE_ID"; // Pipedrive stage ID of the document-delay stage. Deals moving into any other stage are skipped.
export const DELAY_LOG_TABLE_ID = "REPLACE_DELAY_LOG_TABLE_ID"; // Zapier Tables table ID of the delay log.

// Value written to the Triage status column of each new row.
export const INITIAL_TRIAGE_STATUS = "Open";
