// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which Zapier Table holds the reviews, then look up its ID with their Zapier Tables connection.
export const LOCATION_ID = "REPLACE_LOCATION_ID"; // Ask the user which Google Business Profile location to watch, then look up its ID with their Google Business Profile connection.

// Keys in the New Review trigger payload that hold each value.
// Not yet verified against a live sample: check them with get_trigger_fields once Google Business Profile is authorized.
export const REVIEW_ID_KEY = "review_id";
export const REVIEW_TEXT_KEY = "comment";
export const REVIEWER_NAME_KEY = "reviewer_name";
export const RATING_KEY = "star_rating";
export const RECEIVED_AT_KEY = "create_time";
