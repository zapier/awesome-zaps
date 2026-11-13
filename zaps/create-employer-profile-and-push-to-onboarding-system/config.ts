// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const ONBOARDING_TABLE_ID = "REPLACE_ONBOARDING_TABLE_ID"; // Zapier Tables ID of the onboarding table (the ID in the table's URL).
export const ONBOARDING_API_URL = "REPLACE_ONBOARDING_API_URL"; // Onboarding/payroll API endpoint that receives each new profile. Until this is a real https URL, the run skips.
export const ONBOARDING_API_TOKEN = "REPLACE_ONBOARDING_API_TOKEN"; // Bearer token for the onboarding API. Replaces the spec's sub-flow token lookup, which has no equivalent here.
export const SALESFORCE_EXTERNAL_ID_FIELD =
  "REPLACE_SALESFORCE_EXTERNAL_ID_FIELD"; // Salesforce custom field that receives the onboarding system's external ID (change to match your org).
export const SALESFORCE_SYNC_STATUS_FIELD =
  "REPLACE_SALESFORCE_SYNC_STATUS_FIELD"; // Salesforce custom field that receives the sync status (change to match your org).

// Salesforce object the trigger watches.
export const SALESFORCE_OBJECT = "Account";
// Salesforce custom field that stores the Sector value (change to match your org).
export const SALESFORCE_SECTOR_FIELD = "Sector__c";
// Status written to each new onboarding record until the API confirms it.
export const INITIAL_STATUS = "In Progress";
