// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const BILLING_EMAIL = "REPLACE_BILLING_EMAIL"; // Billing inbox that receives the alert. Use a Gmail address connected to your account.

// Base link to the subscription record in Stripe; the subscription ID is appended.
export const SUBSCRIPTION_LINK_BASE =
  "https://dashboard.stripe.com/subscriptions/";
