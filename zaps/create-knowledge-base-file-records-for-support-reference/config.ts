// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const KB_PARENT_FOLDER_ID = "REPLACE_KB_PARENT_FOLDER_ID"; // Ask the user which HubSpot folder holds the knowledge-base files, then look up its folder ID with their HubSpot connection. It is the HubSpot File Manager folder to index.
export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which Zapier Table holds the file records, then look up its ID with their Zapier Tables connection. It gets one record per knowledge-base file.
export const URL_FIELD = "REPLACE_URL_FIELD"; // Ask the user which table field holds the file's public URL, then look up its field key with their Zapier Tables connection. This is also the dedupe key.
export const TITLE_FIELD = "REPLACE_TITLE_FIELD"; // Ask the user which table field holds the file name, then look up its field key with their Zapier Tables connection. The name is written to the record's title field.
export const NOTES_FIELD = "REPLACE_NOTES_FIELD"; // Ask the user which table field holds the notes, then look up its field key with their Zapier Tables connection.

// Text written to the notes column of each new record.
export const NOTES_TEXT = "Indexed by hourly knowledge-base scan";
