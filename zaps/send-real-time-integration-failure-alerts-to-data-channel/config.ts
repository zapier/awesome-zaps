import { ask } from "zap-pack";

export const SLACK_CHANNEL = ask(
  "Slack channel ID that receives the failure alerts (the long ID shown in the channel's details).",
);
// Text placed before each alert, e.g. "<!channel> " to ping the channel. Leave empty for no mention.
export const MENTION_PREFIX = "";
