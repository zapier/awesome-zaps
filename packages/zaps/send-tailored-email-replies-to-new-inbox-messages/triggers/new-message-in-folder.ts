import type { Trigger } from "zap-pack";

import microsoftOutlook from "@/connections/microsoft-outlook";

export default {
  app: "microsoft-outlook",
  event: "new_message_in_folder",
  connection: microsoftOutlook,
  params: {},
} satisfies Trigger;
