import { ask } from "zap-pack";

export const DOWNSTREAM_WEBHOOK_URL = ask(
  "Downstream billing endpoint (your billing workflow's catch-hook URL) that receives each accepted estimate.",
);
// QuickBooks estimate status that lets an estimate continue. Estimates in any other status are skipped.
export const ACCEPTED_STATUS = "Accepted";
// Separator between line items in the joined description and quantity strings.
export const LINE_DELIMITER = "; ";
