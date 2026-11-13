// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const NOTION_DATA_SOURCE_ID = "REPLACE_NOTION_DATA_SOURCE_ID"; // Ask the user which Notion database holds the design records, then look up its data source ID with their Notion connection.

// Title property on the design records. The uploaded file's name, without its extension, must match this.
export const NOTION_TITLE_PROPERTY = "Name";
// URL property on the design record that receives the Dropbox share link.
export const NOTION_DOWNLOAD_URL_PROPERTY = "Download URL";
