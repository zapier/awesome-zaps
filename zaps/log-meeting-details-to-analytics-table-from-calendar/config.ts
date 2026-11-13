// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const CALENDAR_ID = "REPLACE_CALENDAR_ID"; // Google Calendar to watch. Set the same value as the trigger's calendarid when you configure the trigger.
export const TABLE_ID = "REPLACE_TABLE_ID"; // Zapier Tables table to log into: the table's ID, from its URL.

// Table field keys, matching the column order: Title, Start, End, Duration (minutes), Attendees, Source ID.
// Source ID is the field the duplicate check looks up.
export const SOURCE_ID_FIELD = "f6";
