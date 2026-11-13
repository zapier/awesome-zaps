// What starts the zap: a rotation event on the on-call calendar, shortly before it starts.
export default {
  app: "google-calendar",
  event: "event_start",
  connection: "google-calendar",
  params: {
    // Ask the user which calendar holds the on-call rotation events, then look up its ID with their Google Calendar connection.
    calendarid: "REPLACE_ON_CALL_CALENDAR_ID",
    // Fires this long before the start, not at it; the event's start time still arrives as effective_at.
    time_length: 15,
    time_unit: "minutes",
  },
};
