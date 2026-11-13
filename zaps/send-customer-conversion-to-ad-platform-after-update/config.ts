// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const CONVERSION_ACTION_NAME = "REPLACE_CONVERSION_ACTION_NAME"; // Google Ads conversion action to credit, by its name in Google Ads.
export const GOOGLE_ADS_ACCOUNT_ID = "REPLACE_GOOGLE_ADS_ACCOUNT_ID"; // Google Ads account to send from ("Use Google Ads as..."), digits only.

// HubSpot contact property that holds the lifecycle stage.
export const LIFECYCLE_PROPERTY = "lifecyclestage";
// Lifecycle value that marks a contact as a customer.
export const CUSTOMER_STAGE = "customer";
