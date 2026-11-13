// What starts the zap: the teardown tag added to a task in the chosen Asana project.
export default {
  app: "asana",
  event: "task_tagged",
  connection: "asana",
  params: {
    // Ask the user which Asana workspace holds the sprint project, then look up its ID with their Asana connection.
    workspace: "REPLACE_ASANA_WORKSPACE_ID",
    // Ask the user which sprint project holds the tasks, then look up its ID with their Asana connection.
    project_id: "REPLACE_ASANA_PROJECT_ID",
    // Ask the user which tag means "tear this down", then look up its ID with their Asana connection.
    tag_id: "REPLACE_ASANA_TAG_ID",
  },
};
