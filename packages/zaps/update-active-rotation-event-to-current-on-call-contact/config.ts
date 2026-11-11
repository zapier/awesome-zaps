import { ask } from "zap-pack";

export const CALENDAR_ID = ask(
  "Google Calendar the trigger watches. Set it as the trigger's calendarid when you publish; the code does not read it.",
);
export const ROUTING_CHANNEL = ask(
  "Slack channel ID that receives the routing message (the spec's sub-workflow target).",
);
