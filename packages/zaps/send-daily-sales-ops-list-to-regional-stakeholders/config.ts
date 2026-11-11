import { ask } from "zap-pack";

export const FOLDER_ID = ask(
  "Google Drive folder ID that holds the worksheet (the long ID in the folder's URL).",
);
export const WORKSHEET_TITLE = ask(
  "Exact title of the worksheet file to send each weekday.",
);
// Subject line for the email.
export const SUBJECT = "Daily sales ops list";
