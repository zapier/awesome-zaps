import type { Trigger } from "zap-pack";

import hubspot from "@/connections/hubspot";

export default {
  app: "hubspot",
  event: "new_contact_in_list_resthook_v3",
  connection: hubspot,
  params: {},
} satisfies Trigger;
