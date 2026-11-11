import type { Trigger } from "zap-pack";

import stripe from "@/connections/stripe";

export default {
  app: "stripe",
  event: "updated_customer_subscription",
  connection: stripe,
  params: {},
} satisfies Trigger;
