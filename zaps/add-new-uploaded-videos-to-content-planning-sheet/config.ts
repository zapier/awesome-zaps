import { ask } from "zap-pack";

export const STAGING_FOLDER_ID = ask(
  "Google Drive folder ID of the staging folder (the last part of the folder's URL).",
);
export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID (the long ID in the sheet's URL).",
);
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
