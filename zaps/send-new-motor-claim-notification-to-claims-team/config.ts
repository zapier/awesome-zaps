// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const CLAIMS_TABLE_ID = "REPLACE_CLAIMS_TABLE_ID"; // Zapier Tables table ID that holds the motor claims (the trigger's table).
export const CLAIMS_INBOX = "REPLACE_CLAIMS_INBOX"; // Address that receives each notification. Use the connected Outlook account's own address for tests.

// Time zone (IANA name) used when printing dates.
export const TIME_ZONE = "UTC";
// Field holding the claimant's name.
export const NAME_FIELD = "name";
// Field holding the claimant's contact details (phone or email).
export const CONTACT_FIELD = "contact";
// Field holding the vehicle insurance expiry date.
export const VEHICLE_EXPIRY_FIELD = "vehicle_expiry";
// Field holding the driving licence expiry date.
export const DRIVING_EXPIRY_FIELD = "driving_expiry";
// Field holding the accident date and time.
export const ACCIDENT_DATETIME_FIELD = "accident_datetime";
// Field holding uploaded attachment URLs (a list, or a single URL).
export const ATTACHMENTS_FIELD = "attachments";
