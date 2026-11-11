import type { Trigger } from "zap-pack";

import zapierTables from "@/connections/zapier-tables";

export default {
  app: "zapier-tables",
  event: "updated_record",
  connection: zapierTables,
  params: {},
} satisfies Trigger;
