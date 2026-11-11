import { ask } from "zap-pack";

export const TACTICAL_DATA_SOURCE_ID = ask(
  "Notion data source ID of the Tactical KRs database (the one the trigger watches).",
);
export const STRATEGIC_DATA_SOURCE_ID = ask(
  "Notion data source ID of the Strategic KRs database.",
);
export const SOURCE_REFERENCE_PROPERTY = ask(
  "Tactical KR property holding the source reference that links it to its strategic KR.",
);
export const STATUS_PROPERTY = ask(
  "Tactical KR status property, and the value that means the KR is in progress.",
);
export const IN_PROGRESS_STATUS = "In progress";
export const SCOPE_CHANGE_PROPERTY = ask(
  "Strategic KR checkbox that flags a scope change, set to true by this workflow.",
);
