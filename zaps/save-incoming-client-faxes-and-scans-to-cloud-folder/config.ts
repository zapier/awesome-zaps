// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const SCANNER_LABEL_ID = "REPLACE_SCANNER_LABEL_ID"; // Ask the user which Gmail label the scanner or fax system files into, then look up its ID (for example "Label_1234567890") with their Gmail connection. The trigger watches this label.
export const PROCESSED_LABEL_ID = "REPLACE_PROCESSED_LABEL_ID"; // Ask the user which Gmail label marks saved mail (create it first if it does not exist), then look up its ID with their Gmail connection. It is added to each saved message.
export const ARCHIVE_FOLDER_ID = "REPLACE_ARCHIVE_FOLDER_ID"; // Ask the user which Google Drive folder is the secure archive (it must already exist), then look up its ID with their Google Drive connection. It is the long ID in the folder's URL.
