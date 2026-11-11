import { ask } from "zap-pack";

export const INTAKE_SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet holding design requests (the long ID in the sheet's URL).",
);
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
export const DIGEST_RECIPIENT = ask(
  "Address the digest is emailed to. Must be the connected Gmail account itself.",
);
