// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const WORKBOOK_ID = "REPLACE_WORKBOOK_ID"; // OneDrive for Business workbook holding the executive KPI table (the long ID in the file's URL).
export const WORKSHEET_ID = "REPLACE_WORKSHEET_ID"; // Worksheet (tab) inside the workbook that holds the KPI rows.
export const LOOKUP_COLUMN = "REPLACE_LOOKUP_COLUMN"; // Column (header name) the PDF's file name, without the .pdf extension, is matched against.
export const KPI_COLUMN = "REPLACE_KPI_COLUMN"; // Column (header name) that receives the extracted percentage.
