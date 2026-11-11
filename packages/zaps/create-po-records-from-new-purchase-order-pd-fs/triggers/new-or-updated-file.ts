import type { Trigger } from "zap-pack";

import onedrive from "@/connections/onedrive";

export default {
  app: "onedrive",
  event: "new_or_updated_file",
  connection: onedrive,
  params: {},
} satisfies Trigger;
