// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const AIRTABLE_BASE_ID = "REPLACE_AIRTABLE_BASE_ID"; // Ask the user which Airtable base holds the archive, then look up its ID (the "app…" ID) with their Airtable connection.
export const AIRTABLE_TABLE = "REPLACE_AIRTABLE_TABLE"; // Ask the user which table in that base holds the archive, then look up its name with their Airtable connection.
export const GUID_FIELD = "REPLACE_GUID_FIELD"; // Ask the user which column stores the Zoom recording GUID, then look up its exact name in that table with their Airtable connection. Existing rows are matched on it.
export const TITLE_FIELD = "REPLACE_TITLE_FIELD"; // Ask the user which column holds the recording title, then look up its exact name in that table with their Airtable connection.
export const VIDEO_URL_FIELD = "REPLACE_VIDEO_URL_FIELD"; // Ask the user which column holds the Vimeo video link, then look up its exact name in that table with their Airtable connection.
export const DATE_FIELD = "REPLACE_DATE_FIELD"; // Ask the user which column holds the meeting start date, then look up its exact name in that table with their Airtable connection.

// Vimeo privacy for uploads: "unlisted" keeps videos off public listings.
export const VIMEO_PRIVACY = "unlisted";
