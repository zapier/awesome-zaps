import { ask } from "zap-pack";

export const SLACK_CHANNEL = ask(
  "Slack channel ID to post notices into (the long ID shown in the channel's details).",
);
