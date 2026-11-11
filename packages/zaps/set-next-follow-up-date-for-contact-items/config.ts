import { ask } from "zap-pack";

export const BOARD_ID = ask(
  "monday.com board ID to watch and update (the number in the board's URL).",
);
export const TRIGGER_COLUMN_ID = ask(
  "Column ID of the date column whose change starts the workflow. Set the same value in the trigger's column_id.",
);
export const NEXT_FOLLOW_UP_COLUMN_ID = ask(
  "Column ID of the next-follow-up date column, overwritten on each update.",
);
