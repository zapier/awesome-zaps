// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const SOURCE_FOLDER_ID = "REPLACE_SOURCE_FOLDER_ID"; // Ask the user which Drive folder receives the build artifacts, then look up its ID with their Google Drive connection. Same value as folder in triggers/file-in-folder.ts.
export const RELEASE_FOLDER_ID = "REPLACE_RELEASE_FOLDER_ID"; // Ask the user which Drive folder should hold the release copies, then look up its ID with their Google Drive connection.
