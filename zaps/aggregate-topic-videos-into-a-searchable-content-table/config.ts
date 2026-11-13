// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const TOPIC_QUERY = "REPLACE_TOPIC_QUERY"; // Ask the user for their topic: the search string the YouTube trigger watches for new uploads.
export const TITLE_KEYWORD = "REPLACE_TITLE_KEYWORD"; // Ask the user which keyword a video title must contain to be kept (case-insensitive).
export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which Zapier Tables table is the content database, then look up its ID with their Zapier Tables connection.
