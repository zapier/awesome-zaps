// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const EXPERIMENT_DATA_SOURCE = "REPLACE_EXPERIMENT_DATA_SOURCE"; // Asana workspace, project and section are set in the trigger config (Task Moved to Section). Use the same values there as your A/B testing section: the workspace ID, the project ID and the section ID. Notion data source (the experiment database) that new entries are created in.

// Notion format of the entry body; markdown renders headings and links.
export const CONTENT_FORMAT = "markdown";
