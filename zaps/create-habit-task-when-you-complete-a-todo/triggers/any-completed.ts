import type { Trigger } from "zap-pack";

import todoist from "@/connections/todoist";

export default {
  app: "todoist",
  event: "any_completed",
  connection: todoist,
  params: {},
} satisfies Trigger;
