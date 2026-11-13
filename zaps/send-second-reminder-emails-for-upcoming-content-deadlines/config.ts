// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const INTERNAL_DOMAIN = "REPLACE_INTERNAL_DOMAIN"; // Your company's email domain. Contributors on this domain are skipped (internal-only addresses).

// Text in the event description that means a submission has already arrived. Matched case-insensitively.
export const SUBMISSION_MARKER = "submission received";
// Time zone used when writing the event date into the email.
export const TIMEZONE = "America/New_York";
