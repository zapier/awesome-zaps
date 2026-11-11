import { ask } from "zap-pack";

export const BOOKINGS_CHANNEL_ID = ask(
  "Slack channel ID to post live chat inquiries to (the bookings channel).",
);
// Bot name shown above each alert.
export const BOT_NAME = "Live Chat Inquiries";
// Bot icon: an emoji or image URL.
export const BOT_ICON = ":speech_balloon:";
