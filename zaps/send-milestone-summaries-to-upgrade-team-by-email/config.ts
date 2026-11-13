// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const CALENDAR_ID = "REPLACE_CALENDAR_ID"; // Ask the user which calendar holds the milestone events, then look up its ID with their Google Calendar connection. The trigger watches it; this code doesn't read it.
export const UPGRADE_EMAIL = "REPLACE_UPGRADE_EMAIL"; // Ask the user which address gets the summaries (the upgrade team's). It must be the connected Gmail account's own address unless they confirm another.
