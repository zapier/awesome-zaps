import { ask } from "zap-pack";

// Keys in the incoming webhook payload that carry the deal ID and the opt-out flag.
export const DEAL_ID_KEY = "deal_id";
export const OPT_OUT_KEY = "opt_out";
export const CONSENT_FIELD_KEY = ask(
  "The Pipedrive deal custom field that stores consent. Use the field's API key from Pipedrive's field settings.",
);
// Values written to the consent field.
export const OPT_IN_VALUE = "YES";
export const OPT_OUT_VALUE = "NO";
