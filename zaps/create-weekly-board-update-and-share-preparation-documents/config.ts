// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const DESTINATION_FOLDER_ID = "REPLACE_DESTINATION_FOLDER_ID"; // OneDrive folder ID where each dated board-update document is saved.
export const TEMPLATE_FILE_ID = "REPLACE_TEMPLATE_FILE_ID"; // OneDrive file ID of the weekly board-update template to copy.
export const BOARD_ITEM_ID = "REPLACE_BOARD_ITEM_ID"; // monday.com item ID that receives the weekly update.

// Prefix for the dated document name; the week-of date is appended.
export const DOC_NAME_PREFIX = "Board update";
