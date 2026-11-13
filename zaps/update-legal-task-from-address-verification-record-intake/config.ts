// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const INTAKE_TABLE_ID = "REPLACE_INTAKE_TABLE_ID"; // Ask the user which Zapier Tables table receives the address verification intake rows, then look up its ID with their Zapier Tables connection. The trigger watches it, and processed rows are deleted from it.
export const CLICKUP_TEAM_ID = "REPLACE_CLICKUP_TEAM_ID"; // Ask the user which ClickUp workspace holds the legal tasks, then look up its ID with their ClickUp connection.
