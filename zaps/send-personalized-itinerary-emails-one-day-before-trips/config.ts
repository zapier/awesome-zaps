import { ask } from "zap-pack";

export const CALENDAR_ID = ask(
  "Google Calendar ID of the travel calendar to watch. Set the same value as the trigger's calendarid.",
);
// Base URL of your itinerary site. The token taken from the event's location URL is appended.
export const ITINERARY_BASE_URL = "https://YOUR_ITINERARY_SITE/";
// Sender alias on the connected Gmail account. Leave empty to send from the account's default address.
export const SENDER_ADDRESS = "";
