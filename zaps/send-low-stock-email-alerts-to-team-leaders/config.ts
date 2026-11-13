// This zap's settings. The column keys are defaults: map the user's sheet headers to their column letters before deploying.
// The branch list is in workflow.ts and the spreadsheet is in triggers/, where each "REPLACE_…" value is set per person.

// Column holding the product title (COL$A = column A).
export const PRODUCT_COLUMN = "COL$A";
// Column holding the branch identifier, used to pick the leaders and threshold.
export const BRANCH_COLUMN = "COL$B";
// Column holding the current stock count.
export const STOCK_COLUMN = "COL$C";
