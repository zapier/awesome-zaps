import type { Trigger } from "zap-pack";

export default {
  app: "schedule",
  event: "everyWeek",
  params: { dow: ["0"], hod: "9:00 AM" },
} satisfies Trigger;
