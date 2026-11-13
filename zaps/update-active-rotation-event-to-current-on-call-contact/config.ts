// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const CALENDAR_ID = "REPLACE_CALENDAR_ID"; // Google Calendar the trigger watches. Set it as the trigger's calendarid when you publish; the code does not read it.
export const ROUTING_CHANNEL = "REPLACE_ROUTING_CHANNEL"; // Slack channel ID that receives the routing message (the spec's sub-workflow target).
