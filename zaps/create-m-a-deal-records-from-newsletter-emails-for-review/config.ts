// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which Zapier table receives one record per deal, then look up its ID with their Zapier Tables connection. It needs the six columns Seller, Buyer, Deal Description, Date, Advisor, Deal Reference.
export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Ask the user which channel gets the team summary, then look up its ID (C…) with their Slack connection.

// Text in front of the Slack summary. "[install-test] " marks test messages; set to "" for real use.
export const MESSAGE_PREFIX = "[install-test] ";
