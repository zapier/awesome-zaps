import type { Trigger } from "zap-pack";

import asana from "@/connections/asana";

export default {
  app: "asana",
  event: "task_tagged",
  connection: asana,
  params: {},
} satisfies Trigger;
