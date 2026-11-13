// What starts the zap: a row in the visitors table is added or updated. workflow.ts checks the milestone and stage before it sends.
export default {
  app: "zapier-tables",
  event: "updated_record",
  connection: "zapier-tables",
  params: {
    // Ask the user which table holds the visitors, then look up its ID with their Zapier Tables connection. Same answer as TABLE_ID in config.ts.
    table_id: "REPLACE_TABLE_ID",
  },
};
