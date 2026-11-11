import { ask } from "zap-pack";

export const KB_PARENT_FOLDER_ID = ask(
  "HubSpot File Manager folder ID of the knowledge-base folder to index.",
);
export const TABLE_ID = ask(
  "Zapier Tables table ID that holds one record per knowledge-base file.",
);
export const URL_FIELD = ask(
  "Table field key for the file's public URL. This is also the dedupe key.",
);
export const TITLE_FIELD = ask(
  "Table field key for the file name, written to the record's title field.",
);
export const NOTES_FIELD = ask("Table field key for the notes column.");
// Text written to the notes column of each new record.
export const NOTES_TEXT = "Indexed by hourly knowledge-base scan";
