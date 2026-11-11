import type { Trigger } from "zap-pack";

import notion from "@/connections/notion";

export default {
  app: "notion",
  event: "new_data_source_item",
  connection: notion,
  params: {},
} satisfies Trigger;
