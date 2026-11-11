import { ask } from "zap-pack";

export const SEARCH_QUERY = ask(
  "Gmail search that starts the workflow, in Gmail search syntax.",
);
export const SUBJECT_CRITERIA = ask(
  "Text the subject must contain before attachments are saved.",
);
export const RECIPIENT_PATTERN = ask(
  "Text the To header must contain, such as the receiving mailbox address.",
);
export const DRIVE_FOLDER_ID = ask(
  "Google Drive folder ID that receives the files (the long ID in the folder's URL).",
);
// Shared drive ID; leave empty to upload to My Drive.
export const SHARED_DRIVE_ID = "";
export const PROCESSED_LABEL_ID = ask(
  "Gmail label ID added to a message once all its attachments are saved.",
);
