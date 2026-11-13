// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const WORKBOOK_ID = "REPLACE_WORKBOOK_ID"; // Ask the user which workbook on OneDrive for Business holds the executive KPI table, then look up its ID (the long ID in its URL) with their Excel connection.
export const WORKSHEET_ID = "REPLACE_WORKSHEET_ID"; // Ask the user which tab in that workbook holds the KPI rows, then look up its ID with their Excel connection.
export const LOOKUP_COLUMN = "REPLACE_LOOKUP_COLUMN"; // Ask the user which column header the PDF's file name, without the .pdf extension, is matched against.
export const KPI_COLUMN = "REPLACE_KPI_COLUMN"; // Ask the user which column header receives the extracted percentage.
