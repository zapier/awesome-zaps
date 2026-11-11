import { ask } from "zap-pack";

export const FEEDBACK_FORM_URL = ask(
  "Feedback survey link, used when the cancellation payload has no feedback_url of its own.",
);
// Retention inbox copied on every email; leave empty to send to the customer only.
export const RETENTION_INBOX_CC = "";
