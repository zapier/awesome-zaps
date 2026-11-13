export default {
  app: "schedule",
  event: "everyDay",
  // The same zone as the workflow's day window, so the run and the row date agree.
  params: {
    hod: "7:00 PM",
    weekends: "yes",
    timezone_override: "America/New_York",
  },
};
