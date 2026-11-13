// What starts the zap: an event starting on the milestone calendar, 15 minutes ahead. workflow.ts skips events whose titles don't match.
export default {
  app: "google-calendar",
  event: "event_start",
  connection: "google-calendar",
  params: {
    // Ask the user which calendar holds the milestone events, then look up its ID with their Google Calendar connection. Same value as CALENDAR_ID in config.ts.
    calendarid: "REPLACE_CALENDAR_ID",
    // How far ahead of the event start the trigger fires.
    time_length: 15,
    time_unit: "minutes",
  },
};
