import type { Trigger } from "zap-pack";

import pipedrive from "@/connections/pipedrive";

export default {
  app: "pipedrive",
  event: "updated_deal_stage_v3",
  connection: pipedrive,
  params: {},
} satisfies Trigger;
