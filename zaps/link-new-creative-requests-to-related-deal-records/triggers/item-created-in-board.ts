// What starts the zap: a new item on the creative requests board in monday.com.
export default {
  app: "monday",
  event: "item_created_in_board",
  connection: "monday",
  params: {
    // Ask the user which board holds creative requests, then look up its ID with their monday.com connection. Same value as REQUESTS_BOARD_ID in config.ts.
    board_id: "REPLACE_REQUESTS_BOARD_ID",
  },
};
