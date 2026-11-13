// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SEARCH_QUERY = "REPLACE_SEARCH_QUERY"; // Gmail search that starts the workflow, in Gmail search syntax.
export const SUBJECT_CRITERIA = "REPLACE_SUBJECT_CRITERIA"; // Text the subject must contain before attachments are saved.
export const RECIPIENT_PATTERN = "REPLACE_RECIPIENT_PATTERN"; // Text the To header must contain, such as the receiving mailbox address.
export const DRIVE_FOLDER_ID = "REPLACE_DRIVE_FOLDER_ID"; // Google Drive folder ID that receives the files (the long ID in the folder's URL).
export const PROCESSED_LABEL_ID = "REPLACE_PROCESSED_LABEL_ID"; // Gmail label ID added to a message once all its attachments are saved.

// Shared drive ID; leave empty to upload to My Drive.
export const SHARED_DRIVE_ID = "";
