// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const CALENDAR_ID = "REPLACE_CALENDAR_ID"; // Ask the user which Google Calendar holds the travel events, then look up its ID with their Google Calendar connection. Set the same value as the trigger's calendarid.

export const ITINERARY_BASE_URL = "REPLACE_ITINERARY_BASE_URL"; // Ask the user for the base URL of their itinerary site, ending in a slash. The token taken from the event's location URL is appended to it.
// Sender alias on the connected Gmail account. Leave empty to send from the account's default address.
export const SENDER_ADDRESS = "";
