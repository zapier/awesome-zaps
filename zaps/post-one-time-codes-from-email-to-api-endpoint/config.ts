// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const ENDPOINT_URL = "REPLACE_ENDPOINT_URL"; // Ask the user for the verification endpoint's URL, the HTTPS address that accepts the code as a JSON POST.
export const VENDOR_SENDER = "REPLACE_VENDOR_SENDER"; // Ask the user which address the vendor's code emails come from. Emails from it always pass the filter; others pass only if a code is found.
