import { ask } from "zap-pack";

export const SCANNER_LABEL_ID = ask(
  'Gmail label ID of the scanner label the trigger watches (for example "Label_1234567890").',
);
export const PROCESSED_LABEL_ID = ask(
  "Gmail label ID added to each saved message so the mailbox stays uncluttered.",
);
export const ARCHIVE_FOLDER_ID = ask(
  "Google Drive folder ID of the secure archive folder (the long ID in the folder's URL).",
);
