import type { Trigger } from "zap-pack";

import facebookLeadAds from "@/connections/facebook-lead-ads";

export default {
  app: "facebook-lead-ads",
  event: "lead",
  connection: facebookLeadAds,
  params: {},
} satisfies Trigger;
