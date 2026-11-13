// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TRELLO_BOARD_ID = "REPLACE_TRELLO_BOARD_ID"; // Trello board to summarize (the ID in the board's URL, or from the board dropdown).
export const RECIPIENT_EMAIL = "REPLACE_RECIPIENT_EMAIL"; // Address the summary is emailed to (a leadership alias or the board owner).

// Sender name shown on the email.
export const FROM_NAME = "IT Leadership Board Summary";
// Text added in front of the email subject. Leave empty for production.
export const SUBJECT_PREFIX = "";
