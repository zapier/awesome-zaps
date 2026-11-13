// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const DRIVE_FOLDER_ID = "REPLACE_DRIVE_FOLDER_ID"; // Google Drive folder ID to save into (the long ID at the end of the folder's URL).

// Gmail search for the trigger, in the same syntax as the Gmail search box. Enter it in the trigger's "Search keywords" field.
export const SEARCH_QUERY = "subject:(trademark search report) has:attachment";
