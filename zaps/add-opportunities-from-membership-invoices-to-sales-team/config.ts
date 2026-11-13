// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const MEMBERSHIP_RECORD_TYPE_ID = "REPLACE_MEMBERSHIP_RECORD_TYPE_ID"; // Ask the user which record type holds membership opportunities, then look up its ID with their Salesforce connection.
export const REVENUE_RECOGNITION_STAGE = "REPLACE_REVENUE_RECOGNITION_STAGE"; // Ask the user which opportunity stage counts as revenue recognition, then look up its exact value with their Salesforce connection. Set on new opportunities for paid invoices.

// Salesforce API name of the Contact field that holds the Stripe customer ID.
export const CONTACT_STRIPE_CUSTOMER_FIELD =
  "REPLACE_CONTACT_STRIPE_CUSTOMER_FIELD"; // Ask the user which Contact field holds the Stripe customer ID, then look up its API name with their Salesforce connection.
// Salesforce API name of the Opportunity field that holds the Stripe invoice ID (external ID).
export const OPPORTUNITY_INVOICE_ID_FIELD =
  "REPLACE_OPPORTUNITY_INVOICE_ID_FIELD"; // Ask the user which Opportunity field holds the Stripe invoice ID, then look up its API name with their Salesforce connection.
// Salesforce API name of the Opportunity membership plan picklist field.
export const OPPORTUNITY_PLAN_FIELD = "REPLACE_OPPORTUNITY_PLAN_FIELD"; // Ask the user which Opportunity picklist holds the membership plan, then look up its API name with their Salesforce connection.
