import type { Trigger } from "zap-pack";

import googleTasks from "@/connections/google-tasks";

export default {
  app: "google-tasks",
  event: "tasks",
  connection: googleTasks,
  params: {},
} satisfies Trigger;
