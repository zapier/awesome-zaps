import type { Trigger } from "zap-pack";

import github from "@/connections/github";

export default {
  app: "github",
  event: "commit",
  connection: github,
  params: {},
} satisfies Trigger;
