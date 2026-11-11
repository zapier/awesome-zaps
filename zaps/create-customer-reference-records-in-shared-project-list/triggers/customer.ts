import type { Trigger } from "zap-pack";

import quickbooks from "@/connections/quickbooks";

export default {
  app: "quickbooks",
  event: "customer_v2",
  connection: quickbooks,
  params: {},
} satisfies Trigger;
