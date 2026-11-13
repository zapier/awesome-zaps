// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const CUSTOM_OBJECT_TYPE_ID = "REPLACE_CUSTOM_OBJECT_TYPE_ID"; // Ask the user which Close custom object type holds the deal risk record, then look up its ID with their Close connection.
export const RISK_INDICATORS_FIELD = "REPLACE_RISK_INDICATORS_FIELD"; // Look up from CUSTOM_OBJECT_TYPE_ID with the user's Close connection: the key of the field that receives the intent signals as risk indicators.
export const RISK_NOTES_FIELD = "REPLACE_RISK_NOTES_FIELD"; // Look up from CUSTOM_OBJECT_TYPE_ID with the user's Close connection: the key of the field that receives the notes.
export const RISK_SIGNALS_LIST_FIELD = "REPLACE_RISK_SIGNALS_LIST_FIELD"; // Look up from CUSTOM_OBJECT_TYPE_ID with the user's Close connection: the key of the list field that receives each intent signal as its own entry.
