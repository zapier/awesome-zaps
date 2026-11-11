import type { Trigger } from "zap-pack";

import excel from "@/connections/excel";

export default {
  app: "excel",
  event: "new_table_row",
  connection: excel,
  params: {},
} satisfies Trigger;
