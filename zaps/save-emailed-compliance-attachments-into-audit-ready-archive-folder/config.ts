// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const ARCHIVE_FOLDER_ID = "REPLACE_ARCHIVE_FOLDER_ID"; // Ask the user which Google Drive folder is the audit-ready archive, then look up its ID (the long ID at the end of the folder's URL) with their Google Drive connection.

// Text added to the start of every saved file name. Leave empty for real use.
export const FILENAME_PREFIX = "";
