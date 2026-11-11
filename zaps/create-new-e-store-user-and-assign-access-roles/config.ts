import { ask } from "zap-pack";

export const CUSTOMER_API_URL = ask(
  "Base URL of your customer platform API, without a trailing slash.",
);
export const DEFAULT_QUICK_START_URL = ask("DEFAULT_QUICK_START_URL");
// Subject line of the onboarding email.
export const ONBOARDING_SUBJECT = "Welcome to the store";
