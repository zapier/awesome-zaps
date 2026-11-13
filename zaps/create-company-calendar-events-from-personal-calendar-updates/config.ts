// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const COMPANY_CALENDAR_ID = "REPLACE_COMPANY_CALENDAR_ID"; // Google Calendar ID of the company calendar that receives the mirrored events.

// Line added to each mirrored event's description, followed by the source event ID.
// The company copy is found on later updates by searching for this marker.
export const MIRROR_MARKER = "Mirrored from personal calendar event";
