import type { Trigger } from "zap-pack";

import shopify from "@/connections/shopify";

export default {
  app: "shopify",
  event: "new_paid_order_v3",
  connection: shopify,
  params: {},
} satisfies Trigger;
