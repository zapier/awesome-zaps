import { ask } from "zap-pack";

export const OKR_ENDPOINT_URL = ask(
  "OKR endpoint that returns the goal list as a JSON array (replace with your URL).",
);
// Salesforce API name of the Strategic Plan object.
export const STRATEGIC_PLAN_OBJECT = "Strategic_Plan__c";
// Salesforce field that stores the external OKR ID used to match records.
export const EXTERNAL_ID_FIELD = "External_OKR_ID__c";
// Fiscal year written to records this workflow creates.
export const FISCAL_YEAR = "FY26";
