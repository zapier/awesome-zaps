import { ask } from "zap-pack";

export const BILLING_LEAD_EMAIL = ask(
  "Billing lead who receives each credit alert (comma-separate up to 5 addresses).",
);
// Display name the alert is sent from.
export const FROM_NAME = "Xero credit alerts";
