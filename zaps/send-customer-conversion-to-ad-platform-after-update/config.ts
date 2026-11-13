// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const CONVERSION_ACTION_NAME = "REPLACE_CONVERSION_ACTION_NAME"; // Look up with the user's Google Ads connection the conversion action to credit (an "Import from Clicks" action), then use its name as it appears in Google Ads.
export const GOOGLE_ADS_ACCOUNT_ID = "REPLACE_GOOGLE_ADS_ACCOUNT_ID"; // Look up with the user's Google Ads connection the account to send from (the one named in "Use Google Ads as..."), digits only. Use the manager account if the conversion action lives there.

// HubSpot contact property that holds the lifecycle stage.
export const LIFECYCLE_PROPERTY = "lifecyclestage";
// Lifecycle value that marks a contact as a customer.
export const CUSTOMER_STAGE = "customer";
