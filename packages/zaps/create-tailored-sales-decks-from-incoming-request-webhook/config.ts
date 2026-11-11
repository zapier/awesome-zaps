import { ask } from "zap-pack";

export const TEMPLATE_PRESENTATION_ID = ask(
  "Google Slides template presentation ID (the long ID in the template's URL). Every deck is copied from it.",
);
export const TABLE_ID = ask(
  "Zapier Tables table that holds the account and opportunity records.",
);
// Table column key for the request identifier, used to find the matching record. Map it to your column.
export const REQUEST_ID_FIELD = "new__data__f2";
// Table column key for the client name, written when a new record is created. Map it to your column.
export const CLIENT_NAME_FIELD = "new__data__f1";
// Table column key for the record status, written when a new record is created. Map it to your column.
export const STATUS_FIELD = "new__data__f3";
// Status written to a newly created record.
export const NEW_RECORD_STATUS = "Deck requested";
