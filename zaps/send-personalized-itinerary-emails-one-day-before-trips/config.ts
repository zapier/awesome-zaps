// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const CALENDAR_ID = "REPLACE_CALENDAR_ID"; // Google Calendar ID of the travel calendar to watch. Set the same value as the trigger's calendarid.

// Base URL of your itinerary site. The token taken from the event's location URL is appended.
export const ITINERARY_BASE_URL = "https://YOUR_ITINERARY_SITE/";
// Sender alias on the connected Gmail account. Leave empty to send from the account's default address.
export const SENDER_ADDRESS = "";
