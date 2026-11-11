import type { Trigger } from "zap-pack";

export default {
  app: "schedule",
  event: "everyHour",
  params: { weekends: "yes" },
} satisfies Trigger;
