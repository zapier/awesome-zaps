// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const BOARD_ID = "REPLACE_BOARD_ID"; // Look up with the user's monday.com connection: the board that holds the contacts (the number in the board's URL). The trigger's board_id takes the same value.
export const TRIGGER_COLUMN_ID = "REPLACE_TRIGGER_COLUMN_ID"; // Look up with the user's monday.com connection: the ID of the date column that records the last contact. The trigger's column_id takes the same value.
export const NEXT_FOLLOW_UP_COLUMN_ID = "REPLACE_NEXT_FOLLOW_UP_COLUMN_ID"; // Look up with the user's monday.com connection: the ID of the date column that holds the next follow-up date. Overwritten on each update.
