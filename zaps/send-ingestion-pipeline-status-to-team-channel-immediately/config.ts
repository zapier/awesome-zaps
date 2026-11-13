// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Slack channel ID to post the status summary to (the ID, not the name, e.g. "C0123456").

// Status value that counts as a finished run. A post also happens whenever error_count is above zero.
export const COMPLETED_STATUS = "completed";
