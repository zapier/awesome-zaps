import { ask } from "zap-pack";

export const TABLE_ID = ask(
  "Zapier Tables table that holds one row per client call, keyed by Zoom meeting ID.",
);
// Table field key for the Zoom meeting ID column (used to match rows).
export const MEETING_ID_FIELD = "f1";
// Table field key for the client name column (used in the file name).
export const CLIENT_NAME_FIELD = "f2";
// Dropbox folder the audio is saved into, for example "/Team/Client calls".
export const DROPBOX_FOLDER = "/YOUR_DROPBOX_FOLDER";
// Status written to a placeholder row when a meeting has no matching row.
export const PLACEHOLDER_STATUS = "Needs client";
// Words added after the client name and date in the saved file name.
export const FILE_SUFFIX = "AudioRecording";
