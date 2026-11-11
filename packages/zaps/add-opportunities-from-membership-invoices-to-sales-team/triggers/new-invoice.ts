import type { Trigger } from "zap-pack";

import stripe from "@/connections/stripe";

export default {
  app: "stripe",
  event: "new_invoice_v2",
  connection: stripe,
  params: {},
} satisfies Trigger;
