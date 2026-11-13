// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const EXPERIMENT_DATA_SOURCE = "REPLACE_EXPERIMENT_DATA_SOURCE"; // Ask the user which Notion database is the experiment database, then look up its data source ID with their Notion connection. New entries are created in it. The trigger's workspace, project and section are set separately, on the trigger.

// Notion format of the entry body; markdown renders headings and links.
export const CONTENT_FORMAT = "markdown";
