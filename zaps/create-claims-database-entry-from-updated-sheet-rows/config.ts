import { ask } from "zap-pack";

export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID (the long ID in the sheet's URL). Also used to build the link back to the row.",
);
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
export const CLAIMS_TABLE_ID = ask(
  "Zapier Table ID for the claims database (the table's ID from its URL).",
);
// Table field key that holds the claim ID. A claim already in the table is skipped. "f1" is the table's first field.
export const REFERENCE_FIELD = "f1";
// Sheet column keys (COL$A = column A) for the claim fields. Map these to your sheet's column letters.
export const CLAIM_ID_COLUMN = "COL$A";
export const CLAIMANT_NAME_COLUMN = "COL$B";
export const POLICY_NUMBER_COLUMN = "COL$C";
export const CLAIM_AMOUNT_COLUMN = "COL$D";
export const STATUS_COLUMN = "COL$E";
export const RECEIVED_AT_COLUMN = "COL$F";
