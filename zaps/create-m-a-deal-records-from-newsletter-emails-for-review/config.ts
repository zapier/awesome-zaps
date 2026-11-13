// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Zapier Tables table ID that receives one record per deal. Create the table with the six columns Seller, Buyer, Deal Description, Date, Advisor, Deal Reference.
export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Slack channel ID for the team summary (the long ID shown in the channel's details).

// Text in front of the Slack summary. "[install-test] " marks test messages; set to "" for real use.
export const MESSAGE_PREFIX = "[install-test] ";
