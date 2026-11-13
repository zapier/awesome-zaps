// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet is the test-content library, then look up its ID (the long ID in the sheet's URL) with their Google Sheets connection.

// Notion property whose value picks the content rows (select, multi-select, status or text).
export const CATEGORY_PROPERTY = "Category";
// Notion rich-text property the seeded test content is written into (replaced on each seed).
export const SEEDED_CONTENT_PROPERTY = "Seeded Test Content";
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Column holding each row's category, matched against the page's category (COL$A = column A).
export const CATEGORY_COLUMN = "COL$A";
// Notion API version sent on direct page reads and writes.
export const NOTION_VERSION = "2022-06-28";
export const NOTION_API = "https://api.notion.com/v1";
