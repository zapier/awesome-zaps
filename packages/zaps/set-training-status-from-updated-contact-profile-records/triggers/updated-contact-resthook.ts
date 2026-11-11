import type { Trigger } from "zap-pack";

import hubspot from "@/connections/hubspot";

export default {
  app: "hubspot",
  event: "updated_contact_resthook_v3",
  connection: hubspot,
  params: {},
} satisfies Trigger;
