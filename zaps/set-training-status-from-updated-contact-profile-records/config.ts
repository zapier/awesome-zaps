// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const TRAINING_PROPERTY = "REPLACE_TRAINING_PROPERTY"; // HubSpot contact property holding the training status. The trigger watches it, and only its changes are processed.
export const STATUS_FLAG_PROPERTY = "REPLACE_STATUS_FLAG_PROPERTY"; // HubSpot checkbox contact property that receives the normalized flag ("true" or "false").
