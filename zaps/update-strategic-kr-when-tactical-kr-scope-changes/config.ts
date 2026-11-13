// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TACTICAL_DATA_SOURCE_ID = "REPLACE_TACTICAL_DATA_SOURCE_ID"; // Look up with the user's Notion connection the data source ID of the Tactical KRs database, the one the trigger watches.
export const STRATEGIC_DATA_SOURCE_ID = "REPLACE_STRATEGIC_DATA_SOURCE_ID"; // Look up with the user's Notion connection the data source ID of the Strategic KRs database.
export const SOURCE_REFERENCE_PROPERTY = "REPLACE_SOURCE_REFERENCE_PROPERTY"; // Look up with the user's Notion connection the tactical KR property that holds the source reference to its strategic KR, and confirm it with the user.
export const STATUS_PROPERTY = "REPLACE_STATUS_PROPERTY"; // Look up with the user's Notion connection the tactical KR status property. The value that means in progress is IN_PROGRESS_STATUS below.
export const SCOPE_CHANGE_PROPERTY = "REPLACE_SCOPE_CHANGE_PROPERTY"; // Look up with the user's Notion connection the strategic KR checkbox that flags a scope change. This workflow sets it to true.

export const IN_PROGRESS_STATUS = "In progress";
