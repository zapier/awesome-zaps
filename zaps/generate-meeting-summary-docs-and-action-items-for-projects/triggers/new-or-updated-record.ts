// What starts the zap: a row added or updated in the meeting tracker table.
export default {
  app: "zapier-tables",
  event: "new_or_updated_record",
  connection: "zapier-tables",
  params: {
    // Ask the user which Zapier Table is the meeting tracker, then look up its ID with their Zapier Tables connection.
    // Its columns must be in the order RecordSchema in workflow.ts expects.
    table_id: "REPLACE_TABLE_ID",
  },
};
