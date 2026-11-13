// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const ONBOARDING_EVENT_TITLE = "REPLACE_ONBOARDING_EVENT_TITLE"; // Title of the onboarding meeting, exactly as it appears in Outlook.
export const ONBOARDING_WINDOW_START = "REPLACE_ONBOARDING_WINDOW_START"; // Start of the window to search for that meeting (ISO 8601 with offset).
export const ONBOARDING_WINDOW_END = "REPLACE_ONBOARDING_WINDOW_END"; // End of the window to search for that meeting (ISO 8601 with offset).

// Outlook calendar ID to search. Leave empty for the connected account's default calendar.
export const CALENDAR_ID = "";
