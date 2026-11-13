// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const KB_PARENT_FOLDER_ID = "REPLACE_KB_PARENT_FOLDER_ID"; // HubSpot File Manager folder ID of the knowledge-base folder to index.
export const TABLE_ID = "REPLACE_TABLE_ID"; // Zapier Tables table ID that holds one record per knowledge-base file.
export const URL_FIELD = "REPLACE_URL_FIELD"; // Table field key for the file's public URL. This is also the dedupe key.
export const TITLE_FIELD = "REPLACE_TITLE_FIELD"; // Table field key for the file name, written to the record's title field.
export const NOTES_FIELD = "REPLACE_NOTES_FIELD"; // Table field key for the notes column.

// Text written to the notes column of each new record.
export const NOTES_TEXT = "Indexed by hourly knowledge-base scan";
