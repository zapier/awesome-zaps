// What starts the zap: a new event on the travel calendar in Google Calendar.
export default {
  app: "google-calendar",
  event: "new_event",
  connection: "google-calendar",
  params: {
    // Ask the user which Google Calendar holds the travel events, then look up its ID with their Google Calendar connection. Same value as CALENDAR_ID in config.ts.
    calendarid: "REPLACE_CALENDAR_ID",
  },
};
