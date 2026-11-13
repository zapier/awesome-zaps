// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const DESTINATION_FOLDER_ID = "REPLACE_DESTINATION_FOLDER_ID"; // Ask the user which OneDrive folder holds the dated copies, then look up its ID with their OneDrive connection. Each dated board-update document is saved here.
export const TEMPLATE_FILE_ID = "REPLACE_TEMPLATE_FILE_ID"; // Ask the user which OneDrive file is the weekly board-update template, then look up its ID with their OneDrive connection. It is copied each week.
export const BOARD_ITEM_ID = "REPLACE_BOARD_ITEM_ID"; // Ask the user which monday.com item receives the weekly update, then look up its ID with their monday.com connection.

// Prefix for the dated document name; the week-of date is appended.
export const DOC_NAME_PREFIX = "Board update";
