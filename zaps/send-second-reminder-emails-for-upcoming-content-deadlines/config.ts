// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const INTERNAL_DOMAIN = "REPLACE_INTERNAL_DOMAIN"; // Ask the user for their company's email domain, without the @. Contributors on it are skipped as internal addresses.
export const BCC_ADDRESS = "REPLACE_BCC_ADDRESS"; // Ask the user which address gets a blind copy of every reminder. It can be their own.

// Text in the event description that means a submission has already arrived. Matched case-insensitively.
export const SUBMISSION_MARKER = "submission received";
// Time zone used when writing the event date into the email.
export const TIMEZONE = "America/New_York";
