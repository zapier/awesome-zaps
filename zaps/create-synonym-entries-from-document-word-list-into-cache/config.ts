// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const WATCHED_FOLDER_ID = "REPLACE_WATCHED_FOLDER_ID"; // Google Drive folder that receives the word-list documents (the folder ID from its URL).
export const TABLE_ID = "REPLACE_TABLE_ID"; // Zapier Table that holds the synonym entries (the table ID).
export const TERM_COLUMN = "REPLACE_TERM_COLUMN"; // Table column that stores the term; existing entries are matched on it.
export const SYNONYMS_COLUMN = "REPLACE_SYNONYMS_COLUMN"; // Table column that stores the synonyms joined into one string.

// Thesaurus endpoint; each term is sent as the `word` query parameter.
export const THESAURUS_URL = "https://YOUR_THESAURUS_API_URL";
// Separator used to join synonyms into the table cell.
export const SYNONYM_SEPARATOR = ", ";
