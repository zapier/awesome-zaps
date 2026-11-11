import type { Trigger } from "zap-pack";

import notion from "@/connections/notion";

export default {
  app: "notion",
  event: "updated_data_source_item_properties",
  connection: notion,
  params: {},
} satisfies Trigger;
