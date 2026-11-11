import { ask } from "zap-pack";

// Notion property whose value picks the content rows (select, multi-select, status or text).
export const CATEGORY_PROPERTY = "Category";
// Notion rich-text property the seeded test content is written into (replaced on each seed).
export const SEEDED_CONTENT_PROPERTY = "Seeded Test Content";
export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID of the test-content library (the long ID in the sheet's URL).",
);
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Column holding each row's category, matched against the page's category (COL$A = column A).
export const CATEGORY_COLUMN = "COL$A";
// Notion API version sent on direct page reads and writes.
export const NOTION_VERSION = "2022-06-28";
export const NOTION_API = "https://api.notion.com/v1";
