import type { Trigger } from "zap-pack";

import googleSheets from "@/connections/google-sheets";

export default {
  app: "google-sheets",
  event: "updated_row_only",
  connection: googleSheets,
  params: {},
} satisfies Trigger;
