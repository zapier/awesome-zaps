// What starts the zap: once each weekday morning, before the first meeting. Ask the user when they start their day.
export default {
  app: "schedule",
  event: "everyDay",
  // 7:30 AM in the account's timezone, weekdays only. HOURS_AHEAD in config.ts counts from this time.
  params: { hod: "7:30 AM", weekends: "no" },
};
