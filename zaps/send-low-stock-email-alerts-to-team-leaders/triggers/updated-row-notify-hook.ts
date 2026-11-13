// What starts the zap: a row added or changed in the inventory spreadsheet's worksheet.
export default {
  app: "google-sheets",
  event: "updated_row_notify_hook",
  connection: "google-sheets",
  params: {
    // Ask the user which spreadsheet holds the stock counts, then look up its ID with their Google Sheets connection.
    spreadsheet: "REPLACE_SPREADSHEET_ID",
    // The first tab. Leave dedupe_column unset so every row change is seen.
    worksheet: "0",
  },
};
