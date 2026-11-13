export default {
  app: "google-calendar",
  event: "event_start",
  connection: "google-calendar",
  params: {
    // Ask the user which calendar holds the rotation events, then look up its ID with their Google Calendar connection. Same value as CALENDAR_ID in config.ts.
    calendarid: "REPLACE_CALENDAR_ID",
    // Fire 15 minutes before each event on that calendar starts.
    time_unit: "minutes",
    time_length: "15",
  },
};
