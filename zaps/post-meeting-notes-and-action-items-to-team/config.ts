import { ask } from "zap-pack";

export const SLACK_CHANNEL_ID = ask(
  "Slack channel ID to post the summary to (the channel's ID, not its name).",
);
export const MEETINGS_TABLE_ID = ask(
  "Zapier Tables table with one row per meeting (columns: title, date, link, action items).",
);
// Line in the transcript that marks where the action items start.
export const ACTION_ITEMS_MARKER = "Suggested next steps";
