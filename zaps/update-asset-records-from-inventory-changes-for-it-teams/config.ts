// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const INVENTORY_DATASOURCE_ID = "REPLACE_INVENTORY_DATASOURCE_ID"; // Notion data source of the inventory database the trigger watches (its ID, from the Notion data source picker).
export const ASSET_DATASOURCE_ID = "REPLACE_ASSET_DATASOURCE_ID"; // Notion data source of the central asset database that gets updated.

// Property on the inventory item that holds the serial number or unique identifier.
export const INVENTORY_IDENTIFIER_PROPERTY = "Serial number";
// Property on the asset item that holds the same identifier, used to find the existing record.
export const ASSET_IDENTIFIER_PROPERTY = "Serial number";
