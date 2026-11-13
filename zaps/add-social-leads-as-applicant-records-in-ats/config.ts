// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const ATS_WEBHOOK_URL = "REPLACE_ATS_WEBHOOK_URL"; // Your applicant tracking system's webhook URL, which accepts applicant records as JSON.
export const INTAKE_STAGE = "REPLACE_INTAKE_STAGE"; // Stage that sourced applicants are assigned to on creation.

// Source tag written to every applicant record.
export const SOURCE_TAG = "Facebook Lead Ads";
