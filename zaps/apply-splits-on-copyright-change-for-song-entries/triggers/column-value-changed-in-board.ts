// What starts the zap: a column value changing on the song board. workflow.ts keeps only changes to the allocation column.
export default {
  app: "monday",
  event: "column_value_changed_in_board",
  connection: "monday",
  params: {
    // Look up with the user's monday.com connection the board that holds the song entries, then use its integer ID. Same value as BOARD_ID in config.ts.
    board_id: "REPLACE_BOARD_ID",
  },
};
