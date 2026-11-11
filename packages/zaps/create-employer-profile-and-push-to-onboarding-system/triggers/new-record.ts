import type { Trigger } from "zap-pack";

import salesforce from "@/connections/salesforce";

export default {
  app: "salesforce",
  event: "new_record",
  connection: salesforce,
  params: {},
} satisfies Trigger;
