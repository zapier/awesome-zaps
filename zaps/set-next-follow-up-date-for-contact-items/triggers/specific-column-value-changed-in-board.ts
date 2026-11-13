// What starts the zap: a date column on the contacts board changes for an item.
export default {
  app: "monday",
  event: "specific_column_value_changed_in_board",
  connection: "monday",
  params: {
    // Look up with the user's monday.com connection: the board that holds the contacts. Same value as BOARD_ID in config.ts.
    board_id: "REPLACE_BOARD_ID",
    // Look up with the user's monday.com connection: the ID of the date column that records the last contact. Same value as TRIGGER_COLUMN_ID in config.ts.
    column_id: "REPLACE_TRIGGER_COLUMN_ID",
  },
};
