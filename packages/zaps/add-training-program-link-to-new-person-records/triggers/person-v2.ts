import type { Trigger } from "zap-pack";

import pipedrive from "@/connections/pipedrive";

export default {
  app: "pipedrive",
  event: "personV2",
  connection: pipedrive,
  params: {},
} satisfies Trigger;
