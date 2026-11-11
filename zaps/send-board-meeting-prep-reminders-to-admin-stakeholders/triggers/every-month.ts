import type { Trigger } from "zap-pack";

export default {
  app: "schedule",
  event: "everyMonth",
  params: { dom: ["1"], hod: "9:00 AM" },
} satisfies Trigger;
