// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const CAMPAIGN_ID = "REPLACE_CAMPAIGN_ID"; // Ask the user which LeadConnector campaign (workflow) is the SMS reminder campaign for the event, then look up its ID with their LeadConnector connection. Each signup is enrolled in it.

// Country code added to 10-digit phone numbers that have no "+" prefix (1 = US and Canada).
export const DEFAULT_COUNTRY_CODE = "1";
// Source written to the contact, so enrollments from this webhook can be traced in LeadConnector.
export const SIGNUP_SOURCE = "webhook";
