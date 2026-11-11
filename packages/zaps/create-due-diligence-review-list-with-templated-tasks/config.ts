import { ask } from "zap-pack";

export const TEAM_ID = ask(
  "ClickUp workspace (team) ID. Found in the ClickUp URL after app.clickup.com/.",
);
export const SPACE_ID = ask("ClickUp space the review lists are created in.");
export const TEMPLATE_ID = ask(
  "ClickUp list template that holds the due-diligence task set.",
);
// Tasks whose name contains this text get the document due date; all others get the review due date.
export const DOCUMENT_TASK_MATCH = "document";
