import { ask } from "zap-pack";

export const SLACK_CHANNEL = ask(
  "Slack channel ID to post alerts into (for example C0123456).",
);
// Bot name shown above each alert.
export const BOT_NAME = "Instagram Tags";
// Bot icon: an emoji such as ":camera:" or an image URL.
export const BOT_ICON = ":camera:";
// Mention markup prepended to the alert when MENTION_ENABLED is true.
export const MENTION_TEXT = "<!subteam^YOUR_GROUP_ID> ";
