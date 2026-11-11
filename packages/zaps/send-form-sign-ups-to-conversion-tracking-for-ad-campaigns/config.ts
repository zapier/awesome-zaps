import { ask } from "zap-pack";

export const LINKEDIN_AD_ACCOUNT = ask(
  "LinkedIn ad account ID that owns the conversion (the number in the Campaign Manager account URL).",
);
export const LINKEDIN_CONVERSION = ask(
  "LinkedIn Conversions API conversion that each form sign-up is reported to.",
);
