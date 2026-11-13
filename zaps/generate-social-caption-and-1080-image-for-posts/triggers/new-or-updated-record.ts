// What starts the zap: a row added or updated in the content table. workflow.ts skips rows without a content idea.
export default {
  app: "zapier-tables",
  event: "new_or_updated_record",
  connection: "zapier-tables",
  params: {
    // Ask the user which table holds the content ideas, then look up its ID with their Zapier Tables connection. It is the long ID in the table's URL. Same value as TABLE_ID in config.ts.
    table_id: "REPLACE_TABLE_ID",
  },
};
