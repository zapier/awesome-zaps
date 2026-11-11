import { ask } from "zap-pack";

export const TABLE_ID = ask(
  "Zapier Table ID the trigger watches; each new row is one contact.",
);
export const GOOGLE_ADS_ACCOUNT_ID = ask(
  "Google Ads account the upload acts as (the customer ID shown in Google Ads).",
);
