// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const INVENTORY_DATASOURCE_ID = "REPLACE_INVENTORY_DATASOURCE_ID"; // Ask the user which Notion database is the inventory, then look up its data source ID with their Notion connection.
export const ASSET_DATASOURCE_ID = "REPLACE_ASSET_DATASOURCE_ID"; // Ask the user which Notion database is the central asset register, then look up its data source ID with their Notion connection.

// Property on the inventory item that holds the serial number or unique identifier.
export const INVENTORY_IDENTIFIER_PROPERTY = "Serial number";
// Property on the asset item that holds the same identifier, used to find the existing record.
export const ASSET_IDENTIFIER_PROPERTY = "Serial number";
