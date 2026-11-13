// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const ENDPOINT_URL = "REPLACE_ENDPOINT_URL"; // Verification endpoint that receives the code as JSON (POST).
export const VENDOR_SENDER = "REPLACE_VENDOR_SENDER"; // The vendor's sender address. Emails from it always pass the filter; others pass only if a code is found.
