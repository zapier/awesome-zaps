import { ask } from "zap-pack";

export const WORKBOOK_ID = ask(
  "Microsoft Excel workbook ID (the OneDrive file the master sheet lives in).",
);
export const WORKSHEET_ID = ask("Worksheet (tab) ID inside that workbook.");
// OneDrive folder ID holding the workbook; "root" is the top of the drive.
export const FOLDER_ID = "root";
// "one_drive" or "sharepoint".
export const STORAGE_SOURCE = "one_drive";
// Column headers in the master sheet. Each must match the worksheet's header row exactly.
export const EMPLOYEE_ID_COLUMN = "Employee ID";
export const EMPLOYEE_NAME_COLUMN = "Employee Name";
export const ABSENCE_TYPE_COLUMN = "Absence Type";
export const START_DATE_COLUMN = "Start Date";
export const END_DATE_COLUMN = "End Date";
export const PROVIDER_COLUMN = "Provider";
export const NOTES_COLUMN = "Notes";
