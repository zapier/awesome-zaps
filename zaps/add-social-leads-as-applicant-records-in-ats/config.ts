// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const ATS_WEBHOOK_URL = "REPLACE_ATS_WEBHOOK_URL"; // Ask the user for their applicant tracking system's webhook URL, the one that accepts applicant records as JSON.
export const INTAKE_STAGE = "REPLACE_INTAKE_STAGE"; // Ask the user which stage sourced applicants are assigned to when created, as named in their applicant tracking system.

// Source tag written to every applicant record.
export const SOURCE_TAG = "Facebook Lead Ads";
