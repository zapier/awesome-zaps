// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const BASE_ID = "REPLACE_BASE_ID"; // Ask the user which base holds the triage table, then look up its ID (starts with "app") with their Airtable connection.
export const TABLE_NAME = "REPLACE_TABLE_NAME"; // Ask the user which table in that base holds the error records, then look up its name with their Airtable connection.

// Field holding the failure link. Used to find an existing record for the same failure.
export const FAILURE_LINK_FIELD = "Failure link";
// Field for the alert title (the Zap's name).
export const TITLE_FIELD = "Title";
// Field for the error details (app and message).
export const ERROR_DETAILS_FIELD = "Error details";
// Field for the latest error notes, overwritten when the same failure repeats.
export const NOTES_FIELD = "Notes";
// Field for triage status.
export const STATUS_FIELD = "Status";
// Status written to every error record for manual triage.
export const ERROR_STATUS = "Error";
