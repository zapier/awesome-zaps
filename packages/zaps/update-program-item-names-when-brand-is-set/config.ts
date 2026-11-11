import { ask } from "zap-pack";

export const BOARD_ID = ask(
  "monday.com board ID of the program board. Used by the trigger and every action.",
);
export const BRAND_COLUMN_ID = ask(
  "Column ID of the Brand column. Setting it starts the rename.",
);
// Text placed between title parts.
export const TITLE_SEPARATOR = " - ";
