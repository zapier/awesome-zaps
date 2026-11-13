// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const REQUESTS_DATA_SOURCE = "REPLACE_REQUESTS_DATA_SOURCE"; // Ask the user which Notion database holds the creative requests, then look up its data source ID with their Notion connection. It must be shared with that connection first.
export const ASSETS_DATA_SOURCE = "REPLACE_ASSETS_DATA_SOURCE"; // Ask the user which Notion database holds the creative asset records, then look up its data source ID with their Notion connection. It must be shared with that connection first.

// Requests property that holds the task permalink URL, matched when looking for an existing request.
export const REQUEST_PERMALINK_PROPERTY = "Permalink";
// Requests title property, set when a new request is created.
export const REQUEST_TITLE_PROPERTY = "Name";
// Assets title property.
export const ASSET_TITLE_PROPERTY = "Name";
// Assets property that holds the asset URL.
export const ASSET_URL_PROPERTY = "URL";
// Assets relation property that links each record to its request.
export const ASSET_REQUEST_PROPERTY = "Request";
// Assets status property, and the value new records get.
export const ASSET_STATUS_PROPERTY = "Status";
export const ASSET_STATUS_NEW = "New";
// Base URL for asset links: `${ASSET_URL_BASE}/${boardId}/${assetId}`, or `${ASSET_URL_BASE}/${assetId}` without a board.
export const ASSET_URL_BASE = "REPLACE_ASSET_URL_BASE"; // Ask the user which host their asset links point at, with no trailing slash.
