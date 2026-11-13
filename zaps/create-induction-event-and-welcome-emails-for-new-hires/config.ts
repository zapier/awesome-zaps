// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Zapier Tables table ID that holds the new-hire records. Also set this as the table in the trigger.
export const HR_CALENDAR_ID = "REPLACE_HR_CALENDAR_ID"; // Google Calendar ID of the HR calendar that the induction event is created on.
export const HR_COORDINATOR_EMAIL = "REPLACE_HR_COORDINATOR_EMAIL"; // HR coordinator address, CC'd on the welcome email to the new hire.
export const IT_EMAIL = "REPLACE_IT_EMAIL"; // IT address: receives the internal provisioning email and is invited to the induction event.
export const LICENSE_OWNERS_EMAIL = "REPLACE_LICENSE_OWNERS_EMAIL"; // License owners address: receives the internal provisioning email.

// Field keys on the Zapier Tables record, as they appear in the trigger payload.
export const NAME = "f1";
export const EMAIL = "f2";
export const START_DATE = "f3";
export const INDUCTION_LINK = "f4";
export const HIRING_MANAGER_EMAIL = "f5";
export const INVITED_AT = "f6";
