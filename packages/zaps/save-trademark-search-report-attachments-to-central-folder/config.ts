import { ask } from "zap-pack";

// Gmail search for the trigger, in the same syntax as the Gmail search box. Enter it in the trigger's "Search keywords" field.
export const SEARCH_QUERY = "subject:(trademark search report) has:attachment";
export const DRIVE_FOLDER_ID = ask(
  "Google Drive folder ID to save into (the long ID at the end of the folder's URL).",
);
