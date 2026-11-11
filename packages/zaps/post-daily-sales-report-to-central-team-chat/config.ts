import { ask } from "zap-pack";

export const SLACK_CHANNEL = ask(
  "Slack channel ID the summary is posted to (open the channel in Slack, then copy its ID).",
);
// Keep "no" so the summary never links or mentions any user or channel.
export const LINK_NAMES = "no";
