// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TEMPLATE_DOC_ID = "REPLACE_TEMPLATE_DOC_ID"; // Ask the user which Google Doc is the template, then look up its ID with their Google Docs connection. It needs a {{report_date}} placeholder.
export const DOC_FOLDER = "REPLACE_DOC_FOLDER"; // Ask the user which Drive folder gets the new documents, then look up its ID with their Google Docs connection, or use "root" for the top level of My Drive.
export const ORG_DOMAIN = "REPLACE_ORG_DOMAIN"; // Ask the user for their Google Workspace domain, used for the organization sharing setting.
export const CLICKUP_WORKSPACE_ID = "REPLACE_CLICKUP_WORKSPACE_ID"; // Ask the user which ClickUp workspace gets the drafting task, then look up its ID (the team ID) with their ClickUp connection.

// Prefix on new document, task and email titles. Empty for real use.
export const TITLE_PREFIX = "";
// Ask the user which ClickUp user drafts the update, then look up their email with their ClickUp connection.
export const DRAFTER_EMAIL = "REPLACE_DRAFTER_EMAIL";
