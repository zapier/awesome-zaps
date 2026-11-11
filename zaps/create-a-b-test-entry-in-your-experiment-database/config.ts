import { ask } from "zap-pack";

export const EXPERIMENT_DATA_SOURCE = ask(
  "Asana workspace, project and section are set in the trigger config (Task Moved to Section). Use the same values there as your A/B testing section: the workspace ID, the project ID and the section ID. Notion data source (the experiment database) that new entries are created in.",
);
// Notion format of the entry body; markdown renders headings and links.
export const CONTENT_FORMAT = "markdown";
