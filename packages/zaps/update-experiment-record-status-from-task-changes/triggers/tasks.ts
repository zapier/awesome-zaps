import type { Trigger } from "zap-pack";

import clickup from "@/connections/clickup";

export default {
  app: "clickup",
  event: "tasks",
  connection: clickup,
  params: {},
} satisfies Trigger;
