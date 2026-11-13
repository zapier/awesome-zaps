// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const WATCHED_FOLDER_ID = "REPLACE_WATCHED_FOLDER_ID"; // Ask the user which Google Drive folder receives the word-list documents, then look up its ID (from its URL) with their Google Drive connection.
export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which Zapier Table holds the synonym entries, then look up its ID with their Zapier Tables connection.
export const TERM_COLUMN = "REPLACE_TERM_COLUMN"; // Look up with the user's Zapier Tables connection: the key of the column in TABLE_ID that stores the term. Existing entries are matched on it.
export const SYNONYMS_COLUMN = "REPLACE_SYNONYMS_COLUMN"; // Look up with the user's Zapier Tables connection: the key of the column in TABLE_ID that stores the synonyms, joined into one string.
export const THESAURUS_URL = "REPLACE_THESAURUS_URL"; // Ask the user which thesaurus API to query. Each term is sent as the `word` query parameter.

// Separator used to join synonyms into the table cell.
export const SYNONYM_SEPARATOR = ", ";
