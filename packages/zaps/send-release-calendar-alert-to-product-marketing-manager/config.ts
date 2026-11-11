import { ask } from "zap-pack";

export const FALLBACK_SLACK_USER_ID = ask(
  "Slack user ID to message when no Slack user matches the event organizer's email.",
);
