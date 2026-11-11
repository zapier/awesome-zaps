import { ask } from "zap-pack";

export const HUBSPOT_LIST_ID = ask(
  "HubSpot contact list whose additions create conversion events. Use the list ID from the list's URL.",
);
export const LINKEDIN_ACCOUNT_ID = ask(
  "LinkedIn ad account ID that owns the conversion (dropdown value on the LinkedIn action).",
);
export const LINKEDIN_CONVERSION_ID = ask(
  "LinkedIn Conversions API conversion that receives each event (dropdown value on the LinkedIn action).",
);
