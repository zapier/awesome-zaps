// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const AIRTABLE_BASE_ID = "REPLACE_AIRTABLE_BASE_ID"; // Airtable base ID (the "app..." part of the base URL).
export const EMPLOYEE_TABLE = "REPLACE_EMPLOYEE_TABLE"; // Name of the Airtable table that holds employee records.
export const EMAIL_FIELD = "REPLACE_EMAIL_FIELD"; // Employee column matched first, against the entry's email.
export const FULL_NAME_FIELD = "REPLACE_FULL_NAME_FIELD"; // Employee column matched as fallback, against the entry's full name (exact match).
export const TIME_TRACKING_LINK_FIELD = "REPLACE_TIME_TRACKING_LINK_FIELD"; // Multi-link column the time-tracking record ID is appended to. Existing links are kept.
