// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const BOARD_ID = "REPLACE_BOARD_ID"; // monday.com board ID to watch and update (the number in the board's URL).
export const TRIGGER_COLUMN_ID = "REPLACE_TRIGGER_COLUMN_ID"; // Column ID of the date column whose change starts the workflow. Set the same value in the trigger's column_id.
export const NEXT_FOLLOW_UP_COLUMN_ID = "REPLACE_NEXT_FOLLOW_UP_COLUMN_ID"; // Column ID of the next-follow-up date column, overwritten on each update.
