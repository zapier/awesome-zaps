export default {
  app: "zapier-tables",
  event: "new_record",
  connection: "zapier-tables",
  params: {
    // Ask the user which table holds the signal alerts, then look up its ID with their Zapier Tables connection. Same answer as TABLE_ID in config.ts.
    table_id: "REPLACE_TABLE_ID",
  },
};
