import { ask } from "zap-pack";

export const BASE_ID = ask(
  'Airtable base ID (starts with "app") that holds the OKR metrics table.',
);
export const TABLE_ID = ask(
  'Airtable table ID (starts with "tbl") of the OKR metrics table.',
);
