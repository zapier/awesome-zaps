import { ask } from "zap-pack";

export const TRIAGE_CHANNEL = ask(
  "Slack channel ID where triage messages are posted (the channel's ID, starting with C).",
);
export const SOURCE_CHANNEL = ask(
  "Slack channel ID the support reaction is watched in. Set the trigger's Channel ID to the same value.",
);
// Reaction name that marks a message as a support request, without colons.
export const SUPPORT_REACTION = "ticket";
// Bot name shown above each triage message.
export const BOT_NAME = "Support Triage";
// Bot icon: a workspace emoji or an image URL.
export const BOT_ICON = ":ticket:";
