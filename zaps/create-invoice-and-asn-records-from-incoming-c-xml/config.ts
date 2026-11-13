// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const DRIVE_FOLDER_ID = "REPLACE_DRIVE_FOLDER_ID"; // Google Drive folder ID where each raw cXML file is saved (the long ID in the folder's URL). Needs a Google Drive connection.
export const TABLE_ID = "REPLACE_TABLE_ID"; // Zapier Tables table ID that holds one row per invoice or ASN.
export const XERO_ORGANIZATION = "REPLACE_XERO_ORGANIZATION"; // Xero organization that invoice lookups run against (organization name or ID).
export const ASN_TEMPLATE_ID = "REPLACE_ASN_TEMPLATE_ID"; // pdfFiller document ID of the ASN PDF template.
