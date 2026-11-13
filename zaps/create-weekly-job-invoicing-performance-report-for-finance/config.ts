// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Zapier Tables table ID holding the jobs (from the table's URL).
export const CLOSED_DATE_FIELD = "REPLACE_CLOSED_DATE_FIELD"; // Table field key for the closed date; each day in the period is searched on it.
export const LOOKUP_VALUE_FIELD = "REPLACE_LOOKUP_VALUE_FIELD"; // Table field key that receives the search value. Not yet verified against a real table.
export const NOTION_DATA_SOURCE_ID = "REPLACE_NOTION_DATA_SOURCE_ID"; // Notion data source ID of the finance report database.
