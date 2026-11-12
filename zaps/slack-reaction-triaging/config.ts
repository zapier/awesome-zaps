import { ask } from "zap-pack";

export const SLACK_CHANNEL_ID = ask(
  "Which channel gets triage posts? (its channel ID, starting with C)",
);
