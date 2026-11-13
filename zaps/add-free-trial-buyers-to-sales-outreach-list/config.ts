// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const OUTREACH_LIST_ID = "REPLACE_OUTREACH_LIST_ID"; // Ask the user which list is the sales outreach list, then look up its ID with their ActiveCampaign connection. Every trial signup is added to it.

// Tag added to each trial buyer after they are on the outreach list.
export const TRIAL_TAG = "Trial buyer";
