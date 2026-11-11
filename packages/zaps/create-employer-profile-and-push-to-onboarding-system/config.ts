import { ask } from "zap-pack";

export const ONBOARDING_TABLE_ID = ask(
  "Zapier Tables ID of the onboarding table (the ID in the table's URL).",
);
export const ONBOARDING_API_URL = ask(
  "Onboarding/payroll API endpoint that receives each new profile. Until this is a real https URL, the run skips.",
);
export const ONBOARDING_API_TOKEN = ask(
  "Bearer token for the onboarding API. Replaces the spec's sub-flow token lookup, which has no equivalent here.",
);
// Salesforce object the trigger watches.
export const SALESFORCE_OBJECT = "Account";
// Salesforce custom field that stores the Sector value (change to match your org).
export const SALESFORCE_SECTOR_FIELD = "Sector__c";
export const SALESFORCE_EXTERNAL_ID_FIELD = ask(
  "Salesforce custom field that receives the onboarding system's external ID (change to match your org).",
);
export const SALESFORCE_SYNC_STATUS_FIELD = ask(
  "Salesforce custom field that receives the sync status (change to match your org).",
);
// Status written to each new onboarding record until the API confirms it.
export const INITIAL_STATUS = "In Progress";
