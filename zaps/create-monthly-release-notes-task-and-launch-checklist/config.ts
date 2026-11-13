// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const WORKSPACE_ID = "REPLACE_WORKSPACE_ID"; // Asana workspace ID (the number in the workspace's URL).
export const PROJECT_ID = "REPLACE_PROJECT_ID"; // Asana project that holds the recurring emails section.
export const TEMPLATE_ID = "REPLACE_TEMPLATE_ID"; // Asana task template the monthly task is created from.
export const SECTION_NAME = "REPLACE_SECTION_NAME"; // Name of the section in that project the monthly task is added to.
export const OWNER_ID = "REPLACE_OWNER_ID"; // Asana user ID of the person assigned the send-date subtask.

// Base name of the monthly task; the month and year are appended.
export const TASK_NAME_PREFIX = "Monthly release notes";
