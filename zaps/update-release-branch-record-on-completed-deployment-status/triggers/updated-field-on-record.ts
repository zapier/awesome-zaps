import type { Trigger } from "zap-pack";

import salesforce from "@/connections/salesforce";

export default {
  app: "salesforce",
  event: "updated_field_on_record",
  connection: salesforce,
  params: {},
} satisfies Trigger;
