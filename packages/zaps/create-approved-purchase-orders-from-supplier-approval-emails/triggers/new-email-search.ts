import type { Trigger } from "zap-pack";

import microsoftOutlook from "@/connections/microsoft-outlook";

export default {
  app: "microsoft-outlook",
  event: "new_email_search",
  connection: microsoftOutlook,
  params: {},
} satisfies Trigger;
