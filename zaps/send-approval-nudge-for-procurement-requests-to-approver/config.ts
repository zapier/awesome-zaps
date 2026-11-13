// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const RECORD_URL_PREFIX = "REPLACE_RECORD_URL_PREFIX"; // Ask the user for the URL of one request page in their procurement system, cut before the request ID and ending in a slash. The record ID is appended to it.
// Only requests in this phase get a nudge; anything else is skipped.
export const APPROVAL_PHASE = "Awaiting approval";
