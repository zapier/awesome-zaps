import type { Trigger } from "zap-pack";

import monday from "@/connections/monday";

export default {
  app: "monday",
  event: "specific_column_value_changed_in_board",
  connection: monday,
  params: {},
} satisfies Trigger;
