import { ask } from "zap-pack";

export const CI_PIPELINE_URL = ask(
  "Endpoint the workflow POSTs to start a pipeline. Must return JSON with the pipeline `id`.",
);
export const CI_STATUS_URL = ask(
  "Status endpoint. The pipeline id is appended as a path segment; the JSON reply has a `status` field.",
);
export const SLACK_CHANNEL = ask(
  "Slack channel ID that receives failure alerts.",
);
// Prefix on every alert. Leave empty; the tested copy used "[install-test] ".
export const MESSAGE_PREFIX = "";
// Mention inserted at the start of the alert when MENTION_ON_FAILURE is true.
export const MENTION_TEXT = "<!subteam^YOUR_GROUP_ID> ";
