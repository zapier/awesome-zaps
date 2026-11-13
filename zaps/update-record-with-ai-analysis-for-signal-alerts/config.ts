// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which table holds the signal alerts, then look up its ID with their Zapier Tables connection. The trigger watches this table for new records.
export const STRATEGY_FIELD = "REPLACE_STRATEGY_FIELD"; // Ask the user which column holds the strategy text, then look up its field key with their Zapier Tables connection. The AI review checks signals against this text.
export const ANALYSIS_FIELD = "REPLACE_ANALYSIS_FIELD"; // Ask the user which column receives the AI verdict and reasoning, then look up its field key with their Zapier Tables connection. Overwritten on each review.
export const REVIEWED_AT_FIELD = "REPLACE_REVIEWED_AT_FIELD"; // Ask the user which column holds the time the record was reviewed, then look up its field key with their Zapier Tables connection.
export const MARKET_DATA_URL = "REPLACE_MARKET_DATA_URL"; // Ask the user for the GET endpoint on their own system that returns recent price and volume series as JSON.

// OpenAI model used for the review.
export const MODEL = "gpt-4o";
