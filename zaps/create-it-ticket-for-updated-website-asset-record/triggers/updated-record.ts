import type { Trigger } from "zap-pack";

import airtable from "@/connections/airtable";

export default {
  app: "airtable",
  event: "updated_record",
  connection: airtable,
  params: {},
} satisfies Trigger;
