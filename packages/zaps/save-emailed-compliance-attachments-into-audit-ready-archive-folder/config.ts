import { ask } from "zap-pack";

export const ARCHIVE_FOLDER_ID = ask(
  "Google Drive folder ID of the audit-ready archive folder (the long ID at the end of the folder's URL).",
);
// Text added to the start of every saved file name. Leave empty for real use.
export const FILENAME_PREFIX = "";
