import { ask } from "zap-pack";

export const PO_TABLE_ID = ask(
  "Zapier Tables table ID for the central PO tracking table.",
);
export const DATE_FIELD = ask(
  "Table field keys, one per value written to a record. Use the keys from your table.",
);
export const ATTACHMENT_FIELD = ask("ATTACHMENT_FIELD");
export const COMPANY_FIELD = ask("COMPANY_FIELD");
export const PO_NUMBER_FIELD = ask("PO_NUMBER_FIELD");
// Value the extraction prompt returns when a field is missing. Treated as absent.
export const NOT_FOUND = "Not Found";
