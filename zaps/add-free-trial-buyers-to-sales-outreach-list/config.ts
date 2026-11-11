import { ask } from "zap-pack";

export const OUTREACH_LIST_ID = ask(
  "ActiveCampaign list ID for your sales outreach list. Every trial signup is added to it.",
);
// Tag added to each trial buyer after they are on the outreach list.
export const TRIAL_TAG = "Trial buyer";
