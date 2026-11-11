import type { Trigger } from "zap-pack";

import microsoftOutlook from "@/connections/microsoft-outlook";

export default {
  app: "microsoft-outlook",
  event: "new_attachment",
  connection: microsoftOutlook,
  params: {},
} satisfies Trigger;
