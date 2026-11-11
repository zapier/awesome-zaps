import type { Trigger } from "zap-pack";

import kit from "@/connections/kit";

export default {
  app: "kit",
  event: "tagHook",
  connection: kit,
  params: {},
} satisfies Trigger;
