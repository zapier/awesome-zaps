// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const PO_TABLE_ID = "REPLACE_PO_TABLE_ID"; // Zapier Tables table ID for the central PO tracking table.
export const DATE_FIELD = "REPLACE_DATE_FIELD"; // Table field keys, one per value written to a record. Use the keys from your table.
export const ATTACHMENT_FIELD = "REPLACE_ATTACHMENT_FIELD"; // ATTACHMENT_FIELD
export const COMPANY_FIELD = "REPLACE_COMPANY_FIELD"; // COMPANY_FIELD
export const PO_NUMBER_FIELD = "REPLACE_PO_NUMBER_FIELD"; // PO_NUMBER_FIELD

// Value the extraction prompt returns when a field is missing. Treated as absent.
export const NOT_FOUND = "Not Found";
