import { ask } from "zap-pack";

export const TEMPLATE_DOC_ID = ask(
  "Google Doc copied each month. Use the ID from its URL (docs.google.com/document/d/<ID>/edit). It needs a {{report_date}} placeholder.",
);
export const DOC_FOLDER = ask(
  'Drive folder ID for new documents. Use your folder\'s ID, or "root" for the top level of My Drive.',
);
export const ORG_DOMAIN = ask(
  "Your Google Workspace domain, used for the organization sharing setting.",
);
// Prefix on new document, task and email titles. Empty for real use.
export const TITLE_PREFIX = "";
export const CLICKUP_WORKSPACE_ID = ask(
  "ClickUp workspace (team) ID, the number in the workspace URL.",
);
// Email of the ClickUp user who gets the drafting task.
export const DRAFTER_EMAIL = "YOUR_EMAIL@example.com";
