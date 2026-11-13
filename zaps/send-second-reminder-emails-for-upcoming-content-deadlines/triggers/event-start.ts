// What starts the zap: an event starting on the content calendar, one week ahead.
export default {
  app: "google-calendar",
  event: "event_start",
  connection: "google-calendar",
  params: {
    // Ask the user which calendar holds the content deadlines, then look up its ID with their Google Calendar connection.
    calendarid: "REPLACE_CALENDAR_ID",
    // How far ahead of the event start the trigger fires.
    time_length: 1,
    time_unit: "weeks",
  },
};
