// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Zapier Tables table ID that the trigger watches for new signal-alert records.
export const STRATEGY_FIELD = "REPLACE_STRATEGY_FIELD"; // Field key holding the record's strategy text, which the AI review checks signals against.
export const ANALYSIS_FIELD = "REPLACE_ANALYSIS_FIELD"; // Field key the AI verdict and reasoning are written to (overwritten on each review).
export const REVIEWED_AT_FIELD = "REPLACE_REVIEWED_AT_FIELD"; // Field key for the time the record was reviewed.
export const MARKET_DATA_URL = "REPLACE_MARKET_DATA_URL"; // GET endpoint that returns recent price and volume series as JSON.

// OpenAI model used for the review.
export const MODEL = "gpt-4o";
