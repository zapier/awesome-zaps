import type { Trigger } from "zap-pack";

import subZapByZapier from "@/connections/sub-zap-by-zapier";

export default {
  app: "sub-zap-by-zapier",
  event: "start_subzap",
  connection: subZapByZapier,
  params: {},
} satisfies Trigger;
