// What starts the zap: a property change on an item in the QA backlog data source.
export default {
  app: "notion",
  event: "updated_data_source_item_properties",
  connection: "notion",
  params: {
    // Ask the user which Notion database is the QA backlog, then look up its data source ID with their Notion connection.
    datasource: "REPLACE_DATA_SOURCE_ID",
  },
};
