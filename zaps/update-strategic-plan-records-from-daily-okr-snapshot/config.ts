// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const OKR_ENDPOINT_URL = "REPLACE_OKR_ENDPOINT_URL"; // Ask the user for the URL of their OKR endpoint, which returns the goal list as a JSON array.

// Salesforce API name of the Strategic Plan object.
export const STRATEGIC_PLAN_OBJECT = "Strategic_Plan__c";
// Salesforce field that stores the external OKR ID used to match records.
export const EXTERNAL_ID_FIELD = "External_OKR_ID__c";
// Fiscal year written to records this workflow creates.
export const FISCAL_YEAR = "FY26";
