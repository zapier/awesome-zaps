export default {
  app: "schedule",
  event: "custom_frequency",
  params: {
    // Monthly with an interval of 6 fires twice a year.
    freq: "1",
    interval: 6,
    // Ask the user for the date of the first reminder, YYYY-MM-DD. It must be in the future.
    start_date: "REPLACE_START_DATE",
    // Time of day the reminder goes out, 12-hour format. Runs on the account's timezone.
    hod: "9:00 AM",
  },
};
