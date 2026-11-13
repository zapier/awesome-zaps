// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const TRAINING_PROPERTY = "REPLACE_TRAINING_PROPERTY"; // Ask the user which HubSpot contact property holds the training status, then look up its internal name with their HubSpot connection. The trigger watches it, and only its changes are processed.
export const STATUS_FLAG_PROPERTY = "REPLACE_STATUS_FLAG_PROPERTY"; // Ask the user which HubSpot checkbox contact property receives the flag, then look up its internal name with their HubSpot connection. It gets "true" or "false"; create it first if it doesn't exist.
