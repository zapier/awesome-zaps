import type { Trigger } from "zap-pack";

import zapierTables from "@/connections/zapier-tables";

export default {
  app: "zapier-tables",
  event: "button_click_record",
  connection: zapierTables,
  params: {},
} satisfies Trigger;
