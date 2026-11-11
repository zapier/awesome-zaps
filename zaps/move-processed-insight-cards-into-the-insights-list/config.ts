import { ask } from "zap-pack";

export const TRELLO_BOARD_ID = ask(
  "Trello board that holds the insight cards (the ID is in the board's URL).",
);
export const TRELLO_INSIGHTS_LIST_ID = ask(
  "Trello list the cards are moved into (the insights list on that board).",
);
