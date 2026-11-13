// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TACTICAL_DATA_SOURCE_ID = "REPLACE_TACTICAL_DATA_SOURCE_ID"; // Notion data source ID of the Tactical KRs database (the one the trigger watches).
export const STRATEGIC_DATA_SOURCE_ID = "REPLACE_STRATEGIC_DATA_SOURCE_ID"; // Notion data source ID of the Strategic KRs database.
export const SOURCE_REFERENCE_PROPERTY = "REPLACE_SOURCE_REFERENCE_PROPERTY"; // Tactical KR property holding the source reference that links it to its strategic KR.
export const STATUS_PROPERTY = "REPLACE_STATUS_PROPERTY"; // Tactical KR status property, and the value that means the KR is in progress.
export const SCOPE_CHANGE_PROPERTY = "REPLACE_SCOPE_CHANGE_PROPERTY"; // Strategic KR checkbox that flags a scope change, set to true by this workflow.

export const IN_PROGRESS_STATUS = "In progress";
