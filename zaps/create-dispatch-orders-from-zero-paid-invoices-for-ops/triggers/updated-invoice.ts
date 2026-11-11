import type { Trigger } from "zap-pack";

import xero from "@/connections/xero";

// Set by hand from SKILL.md: organization (the Xero organization to watch); status: paid.
export default {
  app: "xero",
  event: "updated_invoice_v2",
  connection: xero,
  params: { status: "paid" },
} satisfies Trigger;
