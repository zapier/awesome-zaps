// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const AIRTABLE_BASE_ID = "REPLACE_AIRTABLE_BASE_ID"; // Ask the user which Airtable base holds employee records, then look up its ID (the "app..." part of the base URL) with their Airtable connection.
export const EMPLOYEE_TABLE = "REPLACE_EMPLOYEE_TABLE"; // Look up with the user's Airtable connection the table in that base that holds employee records.
export const EMAIL_FIELD = "REPLACE_EMAIL_FIELD"; // Look up with the user's Airtable connection the employee column that holds email addresses. Matched first, against the entry's email.
export const FULL_NAME_FIELD = "REPLACE_FULL_NAME_FIELD"; // Look up with the user's Airtable connection the employee column that holds full names. Matched as fallback, against the entry's full name (exact match).
export const TIME_TRACKING_LINK_FIELD = "REPLACE_TIME_TRACKING_LINK_FIELD"; // Look up with the user's Airtable connection the multi-link column the time-tracking record ID is appended to. Existing links are kept.
