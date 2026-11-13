// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const SOURCE_TASK_LIST_ID = "REPLACE_SOURCE_TASK_LIST_ID"; // Ask the user which Google Tasks list gets the new tasks, then look up its ID with their Google Tasks connection. Use the same ID as the trigger's Task List.
export const PRIMARY_TASK_LIST_ID = "REPLACE_PRIMARY_TASK_LIST_ID"; // Ask the user which Google Tasks list is their primary list, then look up its ID with their Google Tasks connection. Copies are created here.
