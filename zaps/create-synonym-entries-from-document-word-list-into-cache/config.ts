import { ask } from "zap-pack";

export const WATCHED_FOLDER_ID = ask(
  "Google Drive folder that receives the word-list documents (the folder ID from its URL).",
);
export const TABLE_ID = ask(
  "Zapier Table that holds the synonym entries (the table ID).",
);
export const TERM_COLUMN = ask(
  "Table column that stores the term; existing entries are matched on it.",
);
export const SYNONYMS_COLUMN = ask(
  "Table column that stores the synonyms joined into one string.",
);
// Thesaurus endpoint; each term is sent as the `word` query parameter.
export const THESAURUS_URL = "https://YOUR_THESAURUS_API_URL";
// Separator used to join synonyms into the table cell.
export const SYNONYM_SEPARATOR = ", ";
