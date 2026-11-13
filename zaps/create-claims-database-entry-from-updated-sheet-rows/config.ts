// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Google Sheets spreadsheet ID (the long ID in the sheet's URL). Also used to build the link back to the row.
export const CLAIMS_TABLE_ID = "REPLACE_CLAIMS_TABLE_ID"; // Zapier Table ID for the claims database (the table's ID from its URL).

// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Table field key that holds the claim ID. A claim already in the table is skipped. "f1" is the table's first field.
export const REFERENCE_FIELD = "f1";
// Sheet column keys (COL$A = column A) for the claim fields. Map these to your sheet's column letters.
export const CLAIM_ID_COLUMN = "COL$A";
export const CLAIMANT_NAME_COLUMN = "COL$B";
export const POLICY_NUMBER_COLUMN = "COL$C";
export const CLAIM_AMOUNT_COLUMN = "COL$D";
export const STATUS_COLUMN = "COL$E";
export const RECEIVED_AT_COLUMN = "COL$F";
