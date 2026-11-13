// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const CI_PIPELINE_URL = "REPLACE_CI_PIPELINE_URL"; // Ask the user for the endpoint of their CI system that starts a pipeline. The workflow POSTs to it, and it must return JSON with the pipeline `id`.
export const CI_STATUS_URL = "REPLACE_CI_STATUS_URL"; // Ask the user for their CI status endpoint. The pipeline id is appended as a path segment, and the JSON reply has a `status` field.
export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Ask the user which channel gets failure alerts, then look up its ID (C…) with their Slack connection.

// Prefix on every alert. Leave empty; the tested copy used "[install-test] ".
export const MESSAGE_PREFIX = "";
// Mention inserted at the start of the alert when MENTION_ON_FAILURE is true.
export const MENTION_TEXT = "<!subteam^GROUP_ID> ";
