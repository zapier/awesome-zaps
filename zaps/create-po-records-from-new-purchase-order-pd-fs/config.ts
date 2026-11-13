// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const PO_TABLE_ID = "REPLACE_PO_TABLE_ID"; // Ask the user which Zapier Table holds the PO register, then look up its ID with their Zapier Tables connection.
export const DATE_FIELD = "REPLACE_DATE_FIELD"; // Look up from PO_TABLE_ID with the user's Zapier Tables connection: the key of the table field that gets the file's date.
export const ATTACHMENT_FIELD = "REPLACE_ATTACHMENT_FIELD"; // Look up from PO_TABLE_ID with the user's Zapier Tables connection: the key of the table field that gets the link to the file.
export const COMPANY_FIELD = "REPLACE_COMPANY_FIELD"; // Look up from PO_TABLE_ID with the user's Zapier Tables connection: the key of the table field that gets the company name.
export const PO_NUMBER_FIELD = "REPLACE_PO_NUMBER_FIELD"; // Look up from PO_TABLE_ID with the user's Zapier Tables connection: the key of the table field that gets the PO number.

// Value the extraction prompt returns when a field is missing. Treated as absent.
export const NOT_FOUND = "Not Found";
