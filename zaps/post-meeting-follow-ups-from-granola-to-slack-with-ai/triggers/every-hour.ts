export default {
  app: "schedule",
  event: "everyHour",
  // Every hour at a quarter past, weekends included. WINDOW_MINUTES in config.ts matches this interval; change both together.
  params: { moh: "15", weekends: "yes" },
};
