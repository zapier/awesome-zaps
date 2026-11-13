// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Ask the user which channel gets the status summary, then look up its ID (C…) with their Slack connection. It is the ID, not the name.

// Status value that counts as a finished run. A post also happens whenever error_count is above zero.
export const COMPLETED_STATUS = "completed";
