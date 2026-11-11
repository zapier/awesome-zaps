import type { Trigger } from "zap-pack";

export default {
  app: "schedule",
  event: "everyHour",
  params: { moh: 0, weekends: "yes" },
} satisfies Trigger;
