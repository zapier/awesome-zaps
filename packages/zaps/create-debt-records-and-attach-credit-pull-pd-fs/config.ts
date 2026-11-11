import { ask } from "zap-pack";

export const CREDIT_PULL_URL = ask(
  "Credit-report API endpoint that receives the pull request. The spec doesn't name a provider, so set this to yours.",
);
// Country code added to 10-digit phone numbers (E.164). Change for non-US clients.
export const DEFAULT_COUNTRY_CODE = "+1";
