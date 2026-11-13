// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const BASE_ID = "REPLACE_BASE_ID"; // Airtable base ID (starts with "app") holding the case table and the KPI table.
export const CASE_TABLE = "REPLACE_CASE_TABLE"; // Case table (table ID or name) whose record is matched by Record ID and updated.
export const KPI_TABLE = "REPLACE_KPI_TABLE"; // KPI tracking table (table ID or name) that receives one entry per track.
