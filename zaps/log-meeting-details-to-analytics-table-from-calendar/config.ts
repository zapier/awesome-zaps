import { ask } from "zap-pack";

export const CALENDAR_ID = ask(
  "Google Calendar to watch. Set the same value as the trigger's calendarid when you configure the trigger.",
);
export const TABLE_ID = ask(
  "Zapier Tables table to log into: the table's ID, from its URL.",
);
// Table field keys, matching the column order: Title, Start, End, Duration (minutes), Attendees, Source ID.
// Source ID is the field the duplicate check looks up.
export const SOURCE_ID_FIELD = "f6";
