import { ask } from "zap-pack";

export const BILLING_EMAIL = ask(
  "Billing inbox that receives the alert. Use a Gmail address connected to your account.",
);
// Base link to the subscription record in Stripe; the subscription ID is appended.
export const SUBSCRIPTION_LINK_BASE =
  "https://dashboard.stripe.com/subscriptions/";
