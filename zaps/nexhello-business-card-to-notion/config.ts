// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const NOTION_DATA_SOURCE_ID = "REPLACE_NOTION_DATA_SOURCE_ID"; // Ask the user which Notion database holds the contacts (the NexHello Contacts one), then look up its data source ID with their Notion connection. Use the data source, not the database ID in the page URL; they differ.

// Notion filter key for the NexHello Contact ID property, used to find an existing contact row.
export const CONTACT_ID_FILTER = "properties|||NexHello Contact ID|||filter";
