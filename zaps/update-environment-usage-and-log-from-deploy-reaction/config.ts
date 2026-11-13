// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Google Sheets spreadsheet ID (the long ID in the sheet's URL) holding both tabs below.
export const LOG_WORKSHEET_ID = "REPLACE_LOG_WORKSHEET_ID"; // Worksheet (tab) ID of the usage log (the number after #gid= in the tab's URL).

// Reaction that marks a deploy (emoji name without colons). Also set as the trigger's Reaction filter.
export const DEPLOY_REACTION = "rocket";
// Text the reacted message must contain (case-insensitive) to count as a deploy message.
export const DEPLOY_MARKER = "deploy";
// Worksheet (tab) ID of the environment registry; the first tab is "0".
export const REGISTRY_WORKSHEET_ID = "0";
// Registry column holding the environment name to match on (COL$A = column A).
export const ENV_NAME_COLUMN = "COL$A";
// Registry column for the environment's status, overwritten with IN_USE_STATUS.
export const STATUS_COLUMN = "COL$B";
// Registry column for the last-used timestamp.
export const LAST_USED_COLUMN = "COL$C";
// Registry column for who last used the environment.
export const LAST_USED_BY_COLUMN = "COL$D";
// Status written to the matching registry row.
export const IN_USE_STATUS = "In use";
// Usage-log columns: timestamp, environment, previous status, new status, reacting user, message link.
export const LOG_TIMESTAMP_COLUMN = "COL$A";
export const LOG_ENV_COLUMN = "COL$B";
export const LOG_PREVIOUS_STATUS_COLUMN = "COL$C";
export const LOG_NEW_STATUS_COLUMN = "COL$D";
export const LOG_REACTED_BY_COLUMN = "COL$E";
export const LOG_MESSAGE_LINK_COLUMN = "COL$F";
