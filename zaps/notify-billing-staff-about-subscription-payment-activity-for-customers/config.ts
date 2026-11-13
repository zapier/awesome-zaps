// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const BILLING_EMAIL = "REPLACE_BILLING_EMAIL"; // Ask the user which billing inbox receives the alert. It must be the address of the connected Gmail account.

// Base link to the subscription record in Stripe; the subscription ID is appended.
export const SUBSCRIPTION_LINK_BASE =
  "https://dashboard.stripe.com/subscriptions/";
