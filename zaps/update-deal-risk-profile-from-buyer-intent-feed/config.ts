import { ask } from "zap-pack";

export const CUSTOM_OBJECT_TYPE_ID = ask(
  "Close custom object type that holds the deal risk record (the type's ID in Close).",
);
export const RISK_INDICATORS_FIELD = ask(
  "Close custom object field that receives the intent signals as risk indicators.",
);
export const RISK_NOTES_FIELD = ask(
  "Close custom object field that receives the notes.",
);
export const RISK_SIGNALS_LIST_FIELD = ask(
  "Close custom object list field that receives each intent signal as its own entry.",
);
