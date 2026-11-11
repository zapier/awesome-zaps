import type { Trigger } from "zap-pack";

import stripeLegacy from "@/connections/stripe-legacy";

export default {
  app: "stripe-legacy",
  event: "charge_v3",
  connection: stripeLegacy,
  params: {},
} satisfies Trigger;
