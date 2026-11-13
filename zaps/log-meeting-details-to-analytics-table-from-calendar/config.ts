// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const CALENDAR_ID = "REPLACE_CALENDAR_ID"; // Ask the user which calendar to watch, then look up its ID with their Google Calendar connection. The same value goes in the trigger's calendarid.
export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which Zapier table is the analytics table, then look up its ID (from its URL) with their Zapier Tables connection.

// Table field keys, matching the column order: Title, Start, End, Duration (minutes), Attendees, Source ID.
// Source ID is the field the duplicate check looks up.
export const SOURCE_ID_FIELD = "f6";
