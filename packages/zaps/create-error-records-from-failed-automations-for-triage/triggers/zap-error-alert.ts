import type { Trigger } from "zap-pack";

import zapierManager from "@/connections/zapier-manager";

export default {
  app: "zapier-manager",
  event: "zap_error_alert",
  connection: zapierManager,
  params: {},
} satisfies Trigger;
