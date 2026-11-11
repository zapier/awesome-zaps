import { ask } from "zap-pack";

export const TABLE_ID = ask(
  "Zapier Tables table ID that the trigger watches for new signal-alert records.",
);
export const STRATEGY_FIELD = ask(
  "Field key holding the record's strategy text, which the AI review checks signals against.",
);
export const ANALYSIS_FIELD = ask(
  "Field key the AI verdict and reasoning are written to (overwritten on each review).",
);
export const REVIEWED_AT_FIELD = ask(
  "Field key for the time the record was reviewed.",
);
export const MARKET_DATA_URL = ask(
  "GET endpoint that returns recent price and volume series as JSON.",
);
// OpenAI model used for the review.
export const MODEL = "gpt-4o";
