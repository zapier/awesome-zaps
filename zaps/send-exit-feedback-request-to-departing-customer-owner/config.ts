// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const FEEDBACK_FORM_URL = "REPLACE_FEEDBACK_FORM_URL"; // Ask the user for the feedback survey link, used when the cancellation payload has no feedback_url of its own.

// Retention inbox copied on every email; leave empty to send to the customer only.
export const RETENTION_INBOX_CC = "";
