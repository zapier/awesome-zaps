// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const WATCHED_CHANNEL = "REPLACE_WATCHED_CHANNEL"; // Ask the user which channel to watch, then look up its ID (C…) with their Slack connection. Must match params.channel in triggers/channel-message.ts.

export const SLACK_WORKSPACE_URL = "REPLACE_SLACK_WORKSPACE_URL"; // Ask the user for their Slack workspace URL (https://<name>.slack.com). Used to build each message's permalink.
// Title of the central competitor intelligence document. Created if no document has this title.
export const INTEL_DOC_TITLE = "Competitor intelligence";
