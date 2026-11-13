// What starts the zap: a new record added to the contact table. Each new row is one contact.
export default {
  app: "zapier-tables",
  event: "new_record",
  connection: "zapier-tables",
  params: {
    // Look up with the user's Zapier Tables connection which table receives the contact rows, then use its ID.
    table_id: "REPLACE_TABLE_ID",
  },
};
