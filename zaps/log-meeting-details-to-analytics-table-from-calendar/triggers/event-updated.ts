// What starts the zap: a new or updated event on the watched calendar. Cancelled events do not fire it.
export default {
  app: "google-calendar",
  event: "event_updated",
  connection: "google-calendar",
  params: {
    // Ask the user which calendar to watch, then look up its ID with their Google Calendar connection. Same value as CALENDAR_ID in config.ts.
    calendarid: "REPLACE_CALENDAR_ID",
    // Expands a recurring event into its occurrences, so each one gets its own row.
    expand_recurring: true,
  },
};
