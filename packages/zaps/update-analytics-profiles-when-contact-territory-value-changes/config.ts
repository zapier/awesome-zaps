import { ask } from "zap-pack";

export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet that holds one analytics profile row per contact (the long ID in the sheet's URL).",
);
// Worksheet (tab) with the profile rows. The first tab is "0".
export const WORKSHEET_ID = "0";
export const TERRITORY_PROPERTY = ask(
  "HubSpot internal name of the territory property. Must match the trigger's property_name.",
);
// Header of the territory column on the profiles sheet, used to compare with the new value.
export const TERRITORY_HEADER = "Territory";
// Column holding the HubSpot contact ID, the first match key (COL$A = column A).
export const CRM_ID_COLUMN = "COL$A";
// Column holding the contact email, the fallback match key.
export const EMAIL_COLUMN = "COL$B";
// Column written with the new territory value.
export const TERRITORY_COLUMN = "COL$C";
// Column written with the lifecycle stage.
export const LIFECYCLE_COLUMN = "COL$D";
// Column written with the time the profile was updated.
export const UPDATED_AT_COLUMN = "COL$E";
