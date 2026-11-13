// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TEMPLATE_DOC_ID = "REPLACE_TEMPLATE_DOC_ID"; // Ask the user which Google Doc is the termination template, then look up its ID (the long ID in its URL) with their Google Docs connection.

// Start of the new document's name; the practice, provider and time are appended.
export const TITLE_PREFIX = "Termination letter";
