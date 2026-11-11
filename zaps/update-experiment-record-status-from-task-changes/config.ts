import { ask } from "zap-pack";

export const CLICKUP_TEAM_ID = ask(
  "ClickUp workspace (team) ID to watch for task changes.",
);
export const AIRTABLE_BASE_ID = ask(
  "Airtable base ID that holds the experiments table.",
);
export const AIRTABLE_TABLE_NAME = ask(
  "Name of the experiments table inside that base.",
);
// Column that stores the ClickUp task permalink. Records are matched on this column.
export const PERMALINK_FIELD = "Task permalink";
// Column for the experiment's status, kept in step with the task.
export const STATUS_FIELD = "Status";
// Column for the task title.
export const TITLE_FIELD = "Task title";
// Column for the assigned owner.
export const OWNER_FIELD = "Owner";
