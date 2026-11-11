import { ask } from "zap-pack";

export const BASE_ID = ask(
  'Airtable base ID (starts with "app") holding the case table and the KPI table.',
);
export const CASE_TABLE = ask(
  "Case table (table ID or name) whose record is matched by Record ID and updated.",
);
export const KPI_TABLE = ask(
  "KPI tracking table (table ID or name) that receives one entry per track.",
);
