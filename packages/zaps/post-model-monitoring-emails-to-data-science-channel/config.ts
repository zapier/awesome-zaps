import { ask } from "zap-pack";

export const SLACK_CHANNEL = ask(
  "Slack channel ID that receives the alert posts (the channel's ID, not its name).",
);
// Heading placed before each alert's subject.
export const ALERT_HEADER = "Model monitoring alert";
// Text placed before each post, e.g. "<!channel> " to ping the channel. Empty means nobody is pinged.
export const MENTION_PREFIX = "";
