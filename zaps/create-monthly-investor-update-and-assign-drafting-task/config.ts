// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TEMPLATE_DOC_ID = "REPLACE_TEMPLATE_DOC_ID"; // Google Doc copied each month. Use the ID from its URL (docs.google.com/document/d/<ID>/edit). It needs a {{report_date}} placeholder.
export const DOC_FOLDER = "REPLACE_DOC_FOLDER"; // Drive folder ID for new documents. Use your folder's ID, or "root" for the top level of My Drive.
export const ORG_DOMAIN = "REPLACE_ORG_DOMAIN"; // Your Google Workspace domain, used for the organization sharing setting.
export const CLICKUP_WORKSPACE_ID = "REPLACE_CLICKUP_WORKSPACE_ID"; // ClickUp workspace (team) ID, the number in the workspace URL.

// Prefix on new document, task and email titles. Empty for real use.
export const TITLE_PREFIX = "";
// Email of the ClickUp user who gets the drafting task.
export const DRAFTER_EMAIL = "YOUR_EMAIL@example.com";
