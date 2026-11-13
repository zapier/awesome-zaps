// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const BASE_ID = "REPLACE_BASE_ID"; // Ask the user which Airtable base holds the case and KPI tables, then look up its ID (starts with "app") with their Airtable connection.
export const CASE_TABLE = "REPLACE_CASE_TABLE"; // Ask the user which table holds the cases, then look up its ID with their Airtable connection. Matched by Record ID and updated.
export const KPI_TABLE = "REPLACE_KPI_TABLE"; // Ask the user which table logs the KPIs, then look up its ID with their Airtable connection. Receives one entry per track.
