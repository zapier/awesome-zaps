import type { Trigger } from "zap-pack";

import activecampaign from "@/connections/activecampaign";

export default {
  app: "activecampaign",
  event: "new_automation_webhook",
  connection: activecampaign,
  params: {},
} satisfies Trigger;
