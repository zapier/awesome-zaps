import { ask } from "zap-pack";

export const TABLE_ID = ask(
  "Zapier Tables table ID holding the jobs (from the table's URL).",
);
export const CLOSED_DATE_FIELD = ask(
  "Table field key for the closed date; each day in the period is searched on it.",
);
export const LOOKUP_VALUE_FIELD = ask(
  "Table field key that receives the search value. Not yet verified against a real table.",
);
export const NOTION_DATA_SOURCE_ID = ask(
  "Notion data source ID of the finance report database.",
);
