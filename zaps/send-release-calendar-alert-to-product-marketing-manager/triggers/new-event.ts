// What starts the zap: a new event on the release calendar.
export default {
  app: "google-calendar",
  event: "new_event",
  connection: "google-calendar",
  params: {
    // Ask the user which Google Calendar is the release calendar, then look up its ID with their Google Calendar connection.
    calendarid: "REPLACE_CALENDAR_ID",
  },
};
