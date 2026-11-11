import type { Trigger } from "zap-pack";

import monday from "@/connections/monday";

export default {
  app: "monday",
  event: "item_created_in_board",
  connection: monday,
  params: {},
} satisfies Trigger;
