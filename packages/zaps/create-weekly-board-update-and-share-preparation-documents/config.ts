import { ask } from "zap-pack";

export const DESTINATION_FOLDER_ID = ask(
  "OneDrive folder ID where each dated board-update document is saved.",
);
export const TEMPLATE_FILE_ID = ask(
  "OneDrive file ID of the weekly board-update template to copy.",
);
// Prefix for the dated document name; the week-of date is appended.
export const DOC_NAME_PREFIX = "Board update";
export const BOARD_ITEM_ID = ask(
  "monday.com item ID that receives the weekly update.",
);
