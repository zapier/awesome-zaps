// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which Zapier Tables table holds the new-hire records, then look up its ID with their Zapier Tables connection. Also set it as table_id in the trigger.
export const HR_CALENDAR_ID = "REPLACE_HR_CALENDAR_ID"; // Look up with the user's Google Calendar connection which calendar is the HR calendar, and use its ID.
export const HR_COORDINATOR_EMAIL = "REPLACE_HR_COORDINATOR_EMAIL"; // Ask the user for the HR coordinator's address, which is CC'd on the welcome email to the new hire.
export const IT_EMAIL = "REPLACE_IT_EMAIL"; // Ask the user for the IT address, which gets the provisioning email and is invited to the induction event.
export const LICENSE_OWNERS_EMAIL = "REPLACE_LICENSE_OWNERS_EMAIL"; // Ask the user for the license owners' address, which gets the provisioning email.

// Field keys on the Zapier Tables record, as they appear in the trigger payload.
export const NAME = "f1";
export const EMAIL = "f2";
export const START_DATE = "f3";
export const INDUCTION_LINK = "f4";
export const HIRING_MANAGER_EMAIL = "f5";
export const INVITED_AT = "f6";
