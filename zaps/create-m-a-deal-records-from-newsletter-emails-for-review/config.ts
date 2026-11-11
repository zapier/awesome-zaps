import { ask } from "zap-pack";

export const TABLE_ID = ask(
  "Zapier Tables table ID that receives one record per deal. Create the table with the six columns Seller, Buyer, Deal Description, Date, Advisor, Deal Reference.",
);
export const SLACK_CHANNEL = ask(
  "Slack channel ID for the team summary (the long ID shown in the channel's details).",
);
// Text in front of the Slack summary. "[install-test] " marks test messages; set to "" for real use.
export const MESSAGE_PREFIX = "[install-test] ";
