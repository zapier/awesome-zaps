// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SOURCE_FOLDER_ID = "REPLACE_SOURCE_FOLDER_ID"; // Ask the user which Drive folder holds the original images, then look up its ID with their Google Drive connection.
export const DESTINATION_FOLDER_ID = "REPLACE_DESTINATION_FOLDER_ID"; // Ask the user which Drive folder gets the resized copies, then look up its ID with their Google Drive connection.

// Suffix added before the file extension: photo.jpg becomes photo-1080x1080.jpg.
export const SIZE_SUFFIX = "-1080x1080";
// Only files whose MIME type starts with this prefix are processed.
export const MIME_PREFIX = "image/";
