// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const CALENDAR_ID = "REPLACE_CALENDAR_ID"; // Ask the user which calendar holds the rotation, then look up its ID with their Google Calendar connection. The trigger watches this calendar; the code does not read it.
export const ROUTING_CHANNEL = "REPLACE_ROUTING_CHANNEL"; // Ask the user which channel gets the routing message, then look up its ID (C…) with their Slack connection. The routing message is posted here.
