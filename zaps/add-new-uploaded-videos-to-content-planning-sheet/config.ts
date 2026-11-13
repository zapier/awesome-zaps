// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const STAGING_FOLDER_ID = "REPLACE_STAGING_FOLDER_ID"; // Ask the user which Drive folder is the staging folder, then look up its ID with their Google Drive connection. It is the last part of the folder's URL.
export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet is the content planning sheet, then look up its ID with their Google Sheets connection. It is the long ID in the sheet's URL.

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Column for the sheet title; the file name is matched here and written here.
export const TITLE_COLUMN = "COL$A";
// Column for the upload timestamp.
export const UPLOADED_AT_COLUMN = "COL$B";
// Column for the link to the file.
export const FILE_LINK_COLUMN = "COL$C";
// Only files whose MIME type starts with this prefix are logged.
export const MIME_PREFIX = "video/";
