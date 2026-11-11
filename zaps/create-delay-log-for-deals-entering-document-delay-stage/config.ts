import { ask } from "zap-pack";

export const DELAY_STAGE_ID = ask(
  "Pipedrive stage ID of the document-delay stage. Deals moving into any other stage are skipped.",
);
export const DELAY_LOG_TABLE_ID = ask(
  "Zapier Tables table ID of the delay log.",
);
// Value written to the Triage status column of each new row.
export const INITIAL_TRIAGE_STATUS = "Open";
