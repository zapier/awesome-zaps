// What starts the zap: a property change on an item in the inventory database.
export default {
  app: "notion",
  event: "updated_data_source_item_properties",
  connection: "notion",
  params: {
    // Ask the user which Notion database is the inventory, then look up its data source ID with their Notion connection. Same value as INVENTORY_DATASOURCE_ID in config.ts.
    datasource: "REPLACE_INVENTORY_DATASOURCE_ID",
  },
};
