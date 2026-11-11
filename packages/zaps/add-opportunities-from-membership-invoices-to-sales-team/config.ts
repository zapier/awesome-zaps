import { ask } from "zap-pack";

export const MEMBERSHIP_RECORD_TYPE_ID = ask(
  "Salesforce record type ID for membership opportunities.",
);
// Salesforce API name of the Contact field that holds the Stripe customer ID.
export const CONTACT_STRIPE_CUSTOMER_FIELD =
  "YOUR_CONTACT_STRIPE_CUSTOMER_FIELD__c";
// Salesforce API name of the Opportunity field that holds the Stripe invoice ID (external ID).
export const OPPORTUNITY_INVOICE_ID_FIELD =
  "YOUR_OPPORTUNITY_INVOICE_ID_FIELD__c";
// Salesforce API name of the Opportunity membership plan picklist field.
export const OPPORTUNITY_PLAN_FIELD = "YOUR_OPPORTUNITY_PLAN_FIELD__c";
export const REVENUE_RECOGNITION_STAGE = ask(
  "Opportunity stage set on new opportunities for paid invoices (the revenue recognition stage).",
);
