// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const BOARD_ID = "REPLACE_BOARD_ID"; // Ask the user which board is the program board, then look up its ID with their monday.com connection. Used by the trigger and every action.
export const BRAND_COLUMN_ID = "REPLACE_BRAND_COLUMN_ID"; // Ask the user which column is Brand, then look up its column ID on that board with their monday.com connection. Setting it starts the rename.

// Column IDs of the dropdowns that come before the Brand value in the title, in order.
export const TITLE_PART_COLUMN_IDS = [
  "REPLACE_TITLE_PART_COLUMN_ID_1", // Ask the user which dropdown columns come before Brand in the title, in order, then look up each column ID with their monday.com connection. The color part must be one of them.
  "REPLACE_TITLE_PART_COLUMN_ID_2", // Ask the user which dropdown columns come before Brand in the title, in order, then look up each column ID with their monday.com connection. The color part must be one of them.
];

// Text placed between title parts.
export const TITLE_SEPARATOR = " - ";
