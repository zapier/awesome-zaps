// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const CREDIT_PULL_URL = "REPLACE_CREDIT_PULL_URL"; // Credit-report API endpoint that receives the pull request. The spec doesn't name a provider, so set this to yours.

// Country code added to 10-digit phone numbers (E.164). Change for non-US clients.
export const DEFAULT_COUNTRY_CODE = "+1";
