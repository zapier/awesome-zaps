import { ask } from "zap-pack";

export const WORKBOOK_ID = ask(
  "OneDrive for Business workbook holding the executive KPI table (the long ID in the file's URL).",
);
export const WORKSHEET_ID = ask(
  "Worksheet (tab) inside the workbook that holds the KPI rows.",
);
export const LOOKUP_COLUMN = ask(
  "Column (header name) the PDF's file name, without the .pdf extension, is matched against.",
);
export const KPI_COLUMN = ask(
  "Column (header name) that receives the extracted percentage.",
);
