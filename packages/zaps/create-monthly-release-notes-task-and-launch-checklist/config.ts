import { ask } from "zap-pack";

export const WORKSPACE_ID = ask(
  "Asana workspace ID (the number in the workspace's URL).",
);
export const PROJECT_ID = ask(
  "Asana project that holds the recurring emails section.",
);
export const TEMPLATE_ID = ask(
  "Asana task template the monthly task is created from.",
);
export const SECTION_NAME = ask(
  "Name of the section in that project the monthly task is added to.",
);
export const OWNER_ID = ask(
  "Asana user ID of the person assigned the send-date subtask.",
);
// Base name of the monthly task; the month and year are appended.
export const TASK_NAME_PREFIX = "Monthly release notes";
