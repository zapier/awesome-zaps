// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet holds the analytics profiles, then look up its ID (the long ID in the sheet's URL) with their Google Sheets connection.
export const TERRITORY_PROPERTY = "REPLACE_TERRITORY_PROPERTY"; // Look up with the user's HubSpot connection the internal name of the territory property. Must match the trigger's property_name.

// Worksheet (tab) with the profile rows. The first tab is "0".
export const WORKSHEET_ID = "0";
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
