import type { Trigger } from "zap-pack";

export default {
  app: "schedule",
  event: "everyMonth",
  params: {
    dom: ["1"],
    hod: "12:00 PM",
    timezone_override: "America/New_York",
  },
} satisfies Trigger;
