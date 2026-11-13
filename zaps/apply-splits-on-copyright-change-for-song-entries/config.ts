// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const BOARD_ID = "REPLACE_BOARD_ID"; // Look up with the user's monday.com connection the board that holds the song entries, then use its integer ID.
export const ALLOCATION_COLUMN_ID = "REPLACE_ALLOCATION_COLUMN_ID"; // Ask the user which column is the copyright/allocation column, then look up its ID with their monday.com connection. Only changes to this column run the zap.
export const CONTRIBUTOR_COUNT_COLUMN_ID =
  "REPLACE_CONTRIBUTOR_COUNT_COLUMN_ID"; // Ask the user which column holds the number of co-writers, then look up its ID with their monday.com connection. Declared for reference; the count comes from the trigger payload.
export const TOTAL_PERCENTAGE_COLUMN_ID = "REPLACE_TOTAL_PERCENTAGE_COLUMN_ID"; // Ask the user which column is the main percentage column, then look up its ID with their monday.com connection. It receives the calculated total of the splits.
export const SPLIT_1_COLUMN_ID = "REPLACE_SPLIT_1_COLUMN_ID"; // Ask the user which column holds the split percentage for co-writer slot 1, then look up its ID with their monday.com connection.
export const SPLIT_2_COLUMN_ID = "REPLACE_SPLIT_2_COLUMN_ID"; // Ask the user which column holds the split percentage for co-writer slot 2, then look up its ID with their monday.com connection.
export const SPLIT_3_COLUMN_ID = "REPLACE_SPLIT_3_COLUMN_ID"; // Ask the user which column holds the split percentage for co-writer slot 3, then look up its ID with their monday.com connection.
export const SPLIT_4_COLUMN_ID = "REPLACE_SPLIT_4_COLUMN_ID"; // Ask the user which column holds the split percentage for co-writer slot 4, then look up its ID with their monday.com connection.
export const SPLIT_5_COLUMN_ID = "REPLACE_SPLIT_5_COLUMN_ID"; // Ask the user which column holds the split percentage for co-writer slot 5, then look up its ID with their monday.com connection.
