// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which Zapier table holds one row per client call, keyed by Zoom meeting ID, then look up its ID with their Zapier Tables connection.
export const DROPBOX_FOLDER = "REPLACE_DROPBOX_FOLDER"; // Ask the user which Dropbox folder is the team's shared folder for client audio, for example /Team/Client calls.

// Table field key for the Zoom meeting ID column (used to match rows).
export const MEETING_ID_FIELD = "f1";
// Table field key for the client name column (used in the file name).
export const CLIENT_NAME_FIELD = "f2";
// Status written to a placeholder row when a meeting has no matching row.
export const PLACEHOLDER_STATUS = "Needs client";
// Words added after the client name and date in the saved file name.
export const FILE_SUFFIX = "AudioRecording";
