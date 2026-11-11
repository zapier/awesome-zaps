import type { Trigger } from "zap-pack";

import jotformEnterprise from "@/connections/jotform-enterprise";

export default {
  app: "jotform-enterprise",
  event: "new_submission",
  connection: jotformEnterprise,
  params: {},
} satisfies Trigger;
