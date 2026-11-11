import type { Trigger } from "zap-pack";

export default {
  app: "schedule",
  event: "everyMonth",
  params: { dom: ["4"], hod: "3:00 PM" },
} satisfies Trigger;
