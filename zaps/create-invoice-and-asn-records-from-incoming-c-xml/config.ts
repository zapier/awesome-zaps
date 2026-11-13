// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const DRIVE_FOLDER_ID = "REPLACE_DRIVE_FOLDER_ID"; // Ask the user which Google Drive folder holds the raw cXML files, then look up its ID with their Google Drive connection. Each raw cXML file is saved there.
export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which Zapier Table holds one row per invoice or ASN, then look up its ID with their Zapier Tables connection.
export const XERO_ORGANIZATION = "REPLACE_XERO_ORGANIZATION"; // Look up with the user's Xero connection which organization holds the invoices, and use its name or ID. Invoice lookups run against it.
export const ASN_TEMPLATE_ID = "REPLACE_ASN_TEMPLATE_ID"; // Ask the user which pdfFiller document is the ASN PDF template, then look up its ID with their pdfFiller connection.
