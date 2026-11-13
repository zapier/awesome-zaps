// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TRELLO_BOARD_ID = "REPLACE_TRELLO_BOARD_ID"; // Look up with the user's Trello connection the board to summarize, then use its ID (the ID in the board's URL).
export const RECIPIENT_EMAIL = "REPLACE_RECIPIENT_EMAIL"; // Ask the user which address gets the summary: a leadership alias or the board owner.

// Sender name shown on the email.
export const FROM_NAME = "IT Leadership Board Summary";
// Text added in front of the email subject. Leave empty for production.
export const SUBJECT_PREFIX = "";
