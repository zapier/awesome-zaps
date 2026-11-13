// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const REQUESTS_BOARD_ID = "REPLACE_REQUESTS_BOARD_ID"; // monday.com board ID of the creative requests board (the board the trigger watches).
export const DEAL_BOARD_ID = "REPLACE_DEAL_BOARD_ID"; // monday.com board ID of the deal tracker to search for a matching deal.
export const RELATION_COLUMN_ID = "REPLACE_RELATION_COLUMN_ID"; // Board-relation column on the requests board that links to the matched deal.

// Column on the deal board to match the search token against (name column key).
export const DEAL_NAME_COLUMN = "name";
