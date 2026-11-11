import { ask } from "zap-pack";

export const LOAN_OBJECT = ask(
  "Salesforce object (API name) that holds the loans.",
);
export const EXTERNAL_LOAN_ID_FIELD = ask(
  "Field on the loan object that stores the external loan ID from the feed.",
);
