import type { Trigger } from "zap-pack";

import greenhouse from "@/connections/greenhouse";

export default {
  app: "greenhouse",
  event: "candidate_v2List",
  connection: greenhouse,
  params: {},
} satisfies Trigger;
