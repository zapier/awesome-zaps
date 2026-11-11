import { ask } from "zap-pack";

export const TABLE_ID = ask(
  "Zapier Tables table that holds your stocks (its table ID).",
);
// Field key the ticker is matched on when looking for an existing row ("f1" = first field).
export const TICKER_LOOKUP_FIELD = "f1";
// Field key the ticker is written to on a new row.
export const TICKER_FIELD = "new__data__f1";
// Field key the market text is saved to on a new row.
export const NOTES_FIELD = "new__data__f2";
// Field key the time the ticker was added is saved to on a new row.
export const TIME_FIELD = "new__data__f3";
// Search link prefix; the ticker and "+stock" are appended to it.
export const SEARCH_URL_PREFIX = "https://www.google.com/search?q=";
