// What starts the zap: a new or changed row in the tracker sheet. workflow.ts skips rows that are not completed or already notified.
export default {
  app: "google-sheets",
  event: "updated_row_notify_hook",
  connection: "google-sheets",
  params: {
    // Ask the user which sheet is the tracker, then look up its ID with their Google Sheets connection. Same answer as SPREADSHEET_ID in config.ts.
    spreadsheet: "REPLACE_SPREADSHEET_ID",
    // The first tab; same as WORKSHEET_ID in config.ts.
    worksheet: "0",
  },
};
