export default {
  app: "zapier-tables",
  event: "new_or_updated_record",
  connection: "zapier-tables",
  params: {
    // Ask the user which table holds the billing records, then look up its ID with their Zapier Tables connection. Same value as TABLE_ID in config.ts.
    table_id: "REPLACE_TABLE_ID",
  },
};
