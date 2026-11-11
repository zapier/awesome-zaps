import type { Trigger } from "zap-pack";

export default {
  app: "schedule",
  event: "everyDay",
  params: { hod: "9:00 AM", weekends: "yes" },
} satisfies Trigger;
