import { ask } from "zap-pack";

export const BOARD_ID = ask(
  "monday.com board ID holding the song entries (integer). Set to your board.",
);
export const ALLOCATION_COLUMN_ID = ask(
  "Copyright/allocation column. Only changes to this column trigger a recalculation.",
);
export const CONTRIBUTOR_COUNT_COLUMN_ID = ask(
  "Column holding the number of co-writers (contributors) on the song.",
);
export const TOTAL_PERCENTAGE_COLUMN_ID = ask(
  "Main percentage column, set to the calculated total of the splits.",
);
