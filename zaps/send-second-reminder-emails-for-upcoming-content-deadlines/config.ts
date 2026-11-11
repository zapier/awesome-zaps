import { ask } from "zap-pack";

export const INTERNAL_DOMAIN = ask(
  "Your company's email domain. Contributors on this domain are skipped (internal-only addresses).",
);
// Text in the event description that means a submission has already arrived. Matched case-insensitively.
export const SUBMISSION_MARKER = "submission received";
// Time zone used when writing the event date into the email.
export const TIMEZONE = "America/New_York";
