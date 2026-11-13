// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const CALENDAR_ID = "REPLACE_CALENDAR_ID"; // Google Calendar ID of the rotation calendar. The trigger watches it and this step updates its events.
export const DEFAULT_CONTACT = "REPLACE_DEFAULT_CONTACT"; // Contact written when no rotation name in the event title matches ROSTER.

// Label for the line written into the event description, so a re-run replaces it instead of adding another.
export const CONTACT_LABEL = "On call:";
