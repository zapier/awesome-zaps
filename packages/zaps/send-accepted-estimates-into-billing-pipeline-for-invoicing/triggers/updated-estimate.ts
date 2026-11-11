import type { Trigger } from "zap-pack";

import quickbooks from "@/connections/quickbooks";

export default {
  app: "quickbooks",
  event: "updated_estimate_v2",
  connection: quickbooks,
  params: {},
} satisfies Trigger;
