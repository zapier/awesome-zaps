// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const BOARD_ID = "REPLACE_BOARD_ID"; // monday.com board ID holding the song entries (integer). Set to your board.
export const ALLOCATION_COLUMN_ID = "REPLACE_ALLOCATION_COLUMN_ID"; // Copyright/allocation column. Only changes to this column trigger a recalculation.
export const CONTRIBUTOR_COUNT_COLUMN_ID =
  "REPLACE_CONTRIBUTOR_COUNT_COLUMN_ID"; // Column holding the number of co-writers (contributors) on the song.
export const TOTAL_PERCENTAGE_COLUMN_ID = "REPLACE_TOTAL_PERCENTAGE_COLUMN_ID"; // Main percentage column, set to the calculated total of the splits.
