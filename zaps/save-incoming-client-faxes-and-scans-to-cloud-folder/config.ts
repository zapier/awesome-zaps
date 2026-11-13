// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const SCANNER_LABEL_ID = "REPLACE_SCANNER_LABEL_ID"; // Gmail label ID of the scanner label the trigger watches (for example "Label_1234567890").
export const PROCESSED_LABEL_ID = "REPLACE_PROCESSED_LABEL_ID"; // Gmail label ID added to each saved message so the mailbox stays uncluttered.
export const ARCHIVE_FOLDER_ID = "REPLACE_ARCHIVE_FOLDER_ID"; // Google Drive folder ID of the secure archive folder (the long ID in the folder's URL).
