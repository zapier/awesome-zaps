import { ask } from "zap-pack";

export const REQUESTS_BOARD_ID = ask(
  "monday.com board ID of the creative requests board (the board the trigger watches).",
);
export const DEAL_BOARD_ID = ask(
  "monday.com board ID of the deal tracker to search for a matching deal.",
);
// Column on the deal board to match the search token against (name column key).
export const DEAL_NAME_COLUMN = "name";
export const RELATION_COLUMN_ID = ask(
  "Board-relation column on the requests board that links to the matched deal.",
);
