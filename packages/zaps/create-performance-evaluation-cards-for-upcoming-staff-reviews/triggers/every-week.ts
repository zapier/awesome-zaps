import type { Trigger } from "zap-pack";

export default {
  app: "schedule",
  event: "everyWeek",
  params: { dow: ["0", "1", "2", "3", "4"], hod: "6:45 AM" },
} satisfies Trigger;
