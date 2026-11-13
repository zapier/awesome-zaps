// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const REQUESTS_BOARD_ID = "REPLACE_REQUESTS_BOARD_ID"; // Ask the user which board holds creative requests, then look up its ID with their monday.com connection.
export const DEAL_BOARD_ID = "REPLACE_DEAL_BOARD_ID"; // Ask the user which board is the deal tracker to search for a matching deal, then look up its ID with their monday.com connection.
export const RELATION_COLUMN_ID = "REPLACE_RELATION_COLUMN_ID"; // Ask the user which board-relation column on the requests board links to the matched deal, then look up its ID with their monday.com connection.

// Column on the deal board to match the search token against (name column key).
export const DEAL_NAME_COLUMN = "name";
