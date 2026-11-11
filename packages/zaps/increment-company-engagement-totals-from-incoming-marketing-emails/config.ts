import { ask } from "zap-pack";

export const TABLE_ID = ask(
  "Zapier Tables table ID of the tracking table (the ID in the table's URL).",
);
// Field key of the Company ID column. Matched on when looking for a company's row.
export const COMPANY_ID_FIELD = "data__f1";
// Field key of the Engagement Count column (a number field).
export const ENGAGEMENT_COUNT_FIELD = "data__f2";
// How much each engagement adds to a company's count. Default is 1 per event.
export const INCREMENT_AMOUNT = "1";
