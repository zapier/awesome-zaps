import { ask } from "zap-pack";

export const CONVERSION_ACTION_NAME = ask(
  "Google Ads conversion action to credit, by its name in Google Ads.",
);
export const GOOGLE_ADS_ACCOUNT_ID = ask(
  'Google Ads account to send from ("Use Google Ads as..."), digits only.',
);
// HubSpot contact property that holds the lifecycle stage.
export const LIFECYCLE_PROPERTY = "lifecyclestage";
// Lifecycle value that marks a contact as a customer.
export const CUSTOMER_STAGE = "customer";
