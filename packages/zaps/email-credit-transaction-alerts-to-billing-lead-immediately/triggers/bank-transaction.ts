import type { Trigger } from "zap-pack";

import xero from "@/connections/xero";

export default {
  app: "xero",
  event: "bank_transaction",
  connection: xero,
  params: {},
} satisfies Trigger;
