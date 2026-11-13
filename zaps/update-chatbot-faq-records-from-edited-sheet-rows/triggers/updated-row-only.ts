// What starts the zap: an edit to a row in the master FAQ sheet. New rows do not fire it.
export default {
  app: "google-sheets",
  event: "updated_row_only",
  connection: "google-sheets",
  params: {
    // Ask the user which sheet is the master FAQ sheet, then look up its ID with their Google Sheets connection.
    spreadsheet: "REPLACE_SPREADSHEET_ID",
    // Worksheet (tab) the FAQ rows are on; the first tab is "0".
    worksheet: "0",
  },
};
