// What starts the zap: an update to a record in the new-hire table.
export default {
  app: "zapier-tables",
  event: "updated_record",
  connection: "zapier-tables",
  params: {
    // Ask the user which Zapier Tables table holds the new-hire records, then look up its ID with their Zapier Tables connection. Same value as TABLE_ID in config.ts.
    table_id: "REPLACE_TABLE_ID",
  },
};
