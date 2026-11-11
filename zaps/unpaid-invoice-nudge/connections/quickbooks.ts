import { connection } from "zap-pack";

export default connection({
  app: "quickbooks",
  description:
    "Required on the QuickBooks path (used by Find Invoice, search `invoice`)",
});
