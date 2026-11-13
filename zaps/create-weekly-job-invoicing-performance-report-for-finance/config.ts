// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which Zapier Table holds the jobs, then look up its ID with their Zapier Tables connection.
export const CLOSED_DATE_FIELD = "REPLACE_CLOSED_DATE_FIELD"; // Ask the user which field holds the closed date, then look up its field key in that table with their Zapier Tables connection.
export const LOOKUP_VALUE_FIELD = "REPLACE_LOOKUP_VALUE_FIELD"; // Look up with the user's Zapier Tables connection the field key that receives each day's search value. Not yet verified against a real table.
export const NOTION_DATA_SOURCE_ID = "REPLACE_NOTION_DATA_SOURCE_ID"; // Ask the user which Notion database receives the report, then look up its data source ID with their Notion connection.
