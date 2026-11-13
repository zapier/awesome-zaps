// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SEARCH_QUERY = "REPLACE_SEARCH_QUERY"; // Ask the user which Gmail search finds the report emails, in Gmail search syntax. The trigger's query uses the same value.
export const SUBJECT_CRITERIA = "REPLACE_SUBJECT_CRITERIA"; // Ask the user what text the subject of a report email must contain. Messages without it are skipped.
export const RECIPIENT_PATTERN = "REPLACE_RECIPIENT_PATTERN"; // Ask the user which receiving address the reports are sent to, then use its text (such as the mailbox address) here; the To header must contain it.
export const DRIVE_FOLDER_ID = "REPLACE_DRIVE_FOLDER_ID"; // Ask the user which Drive folder receives the files, then look up its ID (the long ID in the folder's URL) with their Google Drive connection. The folder must already exist.
export const PROCESSED_LABEL_ID = "REPLACE_PROCESSED_LABEL_ID"; // Ask the user which Gmail label marks processed messages, then look up its ID with their Gmail connection. The label must already exist.

// Shared drive ID; leave empty to upload to My Drive.
export const SHARED_DRIVE_ID = "";
