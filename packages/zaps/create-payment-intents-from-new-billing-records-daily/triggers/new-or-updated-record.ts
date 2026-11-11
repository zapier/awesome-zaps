import type { Trigger } from "zap-pack";

import zapierTables from "@/connections/zapier-tables";

export default {
  app: "zapier-tables",
  event: "new_or_updated_record",
  connection: zapierTables,
  params: {},
} satisfies Trigger;
