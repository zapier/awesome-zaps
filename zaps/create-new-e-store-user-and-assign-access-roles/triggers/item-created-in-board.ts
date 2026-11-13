// What starts the zap: a new item on the intake board in monday.com.
export default {
  app: "monday",
  event: "item_created_in_board",
  connection: "monday",
  params: {
    // Ask the user which monday.com board is the intake board, then look up its ID with their monday.com connection.
    board_id: "REPLACE_INTAKE_BOARD_ID",
  },
};
