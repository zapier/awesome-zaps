// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const AIRTABLE_BASE_ID = "REPLACE_AIRTABLE_BASE_ID"; // Airtable base ID (the "app..." ID in the base's URL).
export const AIRTABLE_TABLE = "REPLACE_AIRTABLE_TABLE"; // Airtable table that holds the video archive.
export const GUID_FIELD = "REPLACE_GUID_FIELD"; // Column that stores the Zoom recording GUID; existing rows are matched on it.
export const TITLE_FIELD = "REPLACE_TITLE_FIELD"; // Column for the recording title.
export const VIDEO_URL_FIELD = "REPLACE_VIDEO_URL_FIELD"; // Column for the Vimeo video link.
export const DATE_FIELD = "REPLACE_DATE_FIELD"; // Column for the meeting start date.

// Vimeo privacy for uploads: "unlisted" keeps videos off public listings.
export const VIMEO_PRIVACY = "unlisted";
