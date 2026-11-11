import type { Trigger } from "zap-pack";

import facebookLeadAdsBeta from "@/connections/facebook-lead-ads-beta";

export default {
  app: "facebook-lead-ads-beta",
  event: "lead",
  connection: facebookLeadAdsBeta,
  params: {},
} satisfies Trigger;
