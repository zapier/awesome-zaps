import { ask } from "zap-pack";

// Gmail search string for order confirmation emails (Gmail search syntax).
export const GMAIL_QUERY = 'subject:"order confirmation" in:inbox';
export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID (the long ID in the sheet's URL).",
);
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
