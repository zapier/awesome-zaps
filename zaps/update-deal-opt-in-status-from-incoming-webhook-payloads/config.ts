// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const CONSENT_FIELD_KEY = "REPLACE_CONSENT_FIELD_KEY"; // The Pipedrive deal custom field that stores consent. Use the field's API key from Pipedrive's field settings.

// Keys in the incoming webhook payload that carry the deal ID and the opt-out flag.
export const DEAL_ID_KEY = "deal_id";
export const OPT_OUT_KEY = "opt_out";
// Values written to the consent field.
export const OPT_IN_VALUE = "YES";
export const OPT_OUT_VALUE = "NO";
