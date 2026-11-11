import { ask } from "zap-pack";

export const REPLY_TO_EMAIL = ask(
  'Team mailbox replies should go to (Reply-To:). Leave "" to reply to the sender.',
);
// Prefix added to every subject, e.g. "Meeting notes: ".
export const SUBJECT_PREFIX = "[install-test] Meeting notes: ";
