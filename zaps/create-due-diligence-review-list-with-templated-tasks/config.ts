// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TEAM_ID = "REPLACE_TEAM_ID"; // ClickUp workspace (team) ID. Found in the ClickUp URL after app.clickup.com/.
export const SPACE_ID = "REPLACE_SPACE_ID"; // ClickUp space the review lists are created in.
export const TEMPLATE_ID = "REPLACE_TEMPLATE_ID"; // ClickUp list template that holds the due-diligence task set.

// Tasks whose name contains this text get the document due date; all others get the review due date.
export const DOCUMENT_TASK_MATCH = "document";
