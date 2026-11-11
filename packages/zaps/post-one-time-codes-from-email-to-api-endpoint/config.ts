import { ask } from "zap-pack";

export const ENDPOINT_URL = ask(
  "Verification endpoint that receives the code as JSON (POST).",
);
export const VENDOR_SENDER = ask(
  "The vendor's sender address. Emails from it always pass the filter; others pass only if a code is found.",
);
