// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const ONBOARDING_EVENT_TITLE = "REPLACE_ONBOARDING_EVENT_TITLE"; // Ask the user for the onboarding meeting's title, exactly as it appears in Outlook.
export const ONBOARDING_WINDOW_START = "REPLACE_ONBOARDING_WINDOW_START"; // Ask the user which date the onboarding meeting falls on, then set the start of the search window (ISO 8601 with offset).
export const ONBOARDING_WINDOW_END = "REPLACE_ONBOARDING_WINDOW_END"; // Ask the user which date the onboarding meeting falls on, then set the end of the search window (ISO 8601 with offset).

// Outlook calendar ID to search. Leave empty for the connected account's default calendar.
export const CALENDAR_ID = "";
