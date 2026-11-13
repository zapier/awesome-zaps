// What starts the zap: a row in the request sheet is updated. workflow.ts checks the status before sending.
export default {
  app: "google-sheets",
  event: "updated_row_only",
  connection: "google-sheets",
  params: {
    // Ask the user which sheet holds the design requests, then look up its ID with their Google Sheets connection. Same sheet as SPREADSHEET_ID in config.ts.
    spreadsheet: "REPLACE_SPREADSHEET_ID",
    // The tab with the requests. Same as WORKSHEET_ID in config.ts; the first tab is "0".
    worksheet: "0",
  },
};
