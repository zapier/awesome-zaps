import { ask } from "zap-pack";

export const FINANCE_RECIPIENTS = ask(
  "Finance and billing recipients, comma separated (up to 5). Replace YOUR_FINANCE_EMAIL before use.",
);
