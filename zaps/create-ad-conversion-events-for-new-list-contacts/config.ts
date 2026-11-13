// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const HUBSPOT_LIST_ID = "REPLACE_HUBSPOT_LIST_ID"; // Ask the user which HubSpot list creates conversion events, then look up its ID with their HubSpot connection. The list ID is also in the list's URL.
export const LINKEDIN_ACCOUNT_ID = "REPLACE_LINKEDIN_ACCOUNT_ID"; // Ask the user which LinkedIn ad account owns the conversion, then look up its ID with their LinkedIn Conversions connection (the account dropdown on the action).
export const LINKEDIN_CONVERSION_ID = "REPLACE_LINKEDIN_CONVERSION_ID"; // Ask the user which Conversions API conversion receives each event, then look up its ID with their LinkedIn Conversions connection (the conversion dropdown on the action). Create one in Campaign Manager first if the dropdown is empty.
