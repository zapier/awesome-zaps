import type { Trigger } from "zap-pack";

import hubspot from "@/connections/hubspot";

export default {
  app: "hubspot",
  event: "email_event",
  connection: hubspot,
  params: {},
} satisfies Trigger;
