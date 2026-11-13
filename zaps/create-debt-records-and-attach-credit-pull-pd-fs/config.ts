// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const CREDIT_PULL_URL = "REPLACE_CREDIT_PULL_URL"; // Ask the user for the endpoint of their credit-report API, which receives the pull request. The spec doesn't name a provider, and the request format and PDF response field must match theirs.

// Country code added to 10-digit phone numbers (E.164). Change for non-US clients.
export const DEFAULT_COUNTRY_CODE = "+1";
