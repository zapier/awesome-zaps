import type { Trigger } from "zap-pack";

import quo from "@/connections/quo";

export default {
  app: "quo",
  event: "new_incoming_message",
  connection: quo,
  params: {},
} satisfies Trigger;
