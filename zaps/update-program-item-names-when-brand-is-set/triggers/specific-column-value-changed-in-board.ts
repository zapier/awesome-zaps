export default {
  app: "monday",
  event: "specific_column_value_changed_in_board",
  connection: "monday",
  params: {
    // Ask the user which board is the program board, then look up its ID with their monday.com connection. Same value as BOARD_ID in config.ts.
    board_id: "REPLACE_BOARD_ID",
    // Ask the user which column is Brand, then look up its column ID on that board with their monday.com connection. Same value as BRAND_COLUMN_ID in config.ts.
    column_id: "REPLACE_BRAND_COLUMN_ID",
  },
};
