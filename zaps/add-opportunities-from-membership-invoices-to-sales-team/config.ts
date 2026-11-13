// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const MEMBERSHIP_RECORD_TYPE_ID = "REPLACE_MEMBERSHIP_RECORD_TYPE_ID"; // Salesforce record type ID for membership opportunities.
export const REVENUE_RECOGNITION_STAGE = "REPLACE_REVENUE_RECOGNITION_STAGE"; // Opportunity stage set on new opportunities for paid invoices (the revenue recognition stage).

// Salesforce API name of the Contact field that holds the Stripe customer ID.
export const CONTACT_STRIPE_CUSTOMER_FIELD =
  "YOUR_CONTACT_STRIPE_CUSTOMER_FIELD__c";
// Salesforce API name of the Opportunity field that holds the Stripe invoice ID (external ID).
export const OPPORTUNITY_INVOICE_ID_FIELD =
  "YOUR_OPPORTUNITY_INVOICE_ID_FIELD__c";
// Salesforce API name of the Opportunity membership plan picklist field.
export const OPPORTUNITY_PLAN_FIELD = "YOUR_OPPORTUNITY_PLAN_FIELD__c";
