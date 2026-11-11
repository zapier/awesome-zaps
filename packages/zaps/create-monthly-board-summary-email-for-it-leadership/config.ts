import { ask } from "zap-pack";

export const TRELLO_BOARD_ID = ask(
  "Trello board to summarize (the ID in the board's URL, or from the board dropdown).",
);
export const RECIPIENT_EMAIL = ask(
  "Address the summary is emailed to (a leadership alias or the board owner).",
);
// Sender name shown on the email.
export const FROM_NAME = "IT Leadership Board Summary";
// Text added in front of the email subject. Leave empty for production.
export const SUBJECT_PREFIX = "";
