// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const CLICKUP_TEAM_ID = "REPLACE_CLICKUP_TEAM_ID"; // ClickUp workspace (team) ID to watch for task changes.
export const AIRTABLE_BASE_ID = "REPLACE_AIRTABLE_BASE_ID"; // Airtable base ID that holds the experiments table.
export const AIRTABLE_TABLE_NAME = "REPLACE_AIRTABLE_TABLE_NAME"; // Name of the experiments table inside that base.

// Column that stores the ClickUp task permalink. Records are matched on this column.
export const PERMALINK_FIELD = "Task permalink";
// Column for the experiment's status, kept in step with the task.
export const STATUS_FIELD = "Status";
// Column for the task title.
export const TITLE_FIELD = "Task title";
// Column for the assigned owner.
export const OWNER_FIELD = "Owner";
