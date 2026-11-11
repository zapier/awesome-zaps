import type { Trigger } from "zap-pack";

import typeform from "@/connections/typeform";

export default {
  app: "typeform",
  event: "entries_resthook_v2",
  connection: typeform,
  params: {},
} satisfies Trigger;
