// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const WORKSPACE_ID = "REPLACE_WORKSPACE_ID"; // Ask the user which workspace holds the project, then look up its ID (the number in the workspace's URL) with their Asana connection.
export const PROJECT_ID = "REPLACE_PROJECT_ID"; // Ask the user which project holds the recurring emails section, then look up its ID with their Asana connection.
export const TEMPLATE_ID = "REPLACE_TEMPLATE_ID"; // Ask the user which task template the monthly task is created from, then look up its ID with their Asana connection.
export const SECTION_NAME = "REPLACE_SECTION_NAME"; // Ask the user for the exact name of the section in that project the monthly task is added to.
export const OWNER_ID = "REPLACE_OWNER_ID"; // Look up with the user's Asana connection the person assigned the send-date subtask, then take their Asana user ID.

// Base name of the monthly task; the month and year are appended.
export const TASK_NAME_PREFIX = "Monthly release notes";
