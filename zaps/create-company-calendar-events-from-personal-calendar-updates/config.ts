// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const COMPANY_CALENDAR_ID = "REPLACE_COMPANY_CALENDAR_ID"; // Look up with the user's Google Calendar connection which calendar receives the mirrored events, then use its calendar ID (usually an address ending in @group.calendar.google.com or the owner's email). The connected account needs edit access to it.

// Line added to each mirrored event's description, followed by the source event ID.
// The company copy is found on later updates by searching for this marker.
export const MIRROR_MARKER = "Mirrored from personal calendar event";
