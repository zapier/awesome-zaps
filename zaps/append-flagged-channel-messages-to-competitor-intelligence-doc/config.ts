// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const WATCHED_CHANNEL = "REPLACE_WATCHED_CHANNEL"; // Slack channel ID to watch, from the channel's details (e.g. "C02M7813E").

// Slack workspace URL, used to build each message's permalink.
export const SLACK_WORKSPACE_URL = "https://YOUR_WORKSPACE.slack.com";
// Title of the central competitor intelligence document. Created if no document has this title.
export const INTEL_DOC_TITLE = "Competitor intelligence";
