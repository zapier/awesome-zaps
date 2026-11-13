// What starts the zap: a new or changed event on the personal calendar.
export default {
  app: "google-calendar",
  event: "event_updated",
  connection: "google-calendar",
  params: {
    // Look up with the user's Google Calendar connection which personal calendar to watch, then use its ID. The primary calendar's ID is the user's email address.
    calendarid: "REPLACE_PERSONAL_CALENDAR_ID",
    // Expanded so each instance of a recurring event triggers the zap, not only the series.
    expand_recurring: true,
  },
};
