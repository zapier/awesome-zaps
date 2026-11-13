// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const TITLE_FIELD = "REPLACE_TITLE_FIELD"; // Ask the user which form question holds the review title, then look up its field key with their Typeform connection.
export const BODY_FIELD = "REPLACE_BODY_FIELD"; // Ask the user which form question holds the review text, then look up its field key with their Typeform connection.
export const RATING_FIELD = "REPLACE_RATING_FIELD"; // Ask the user which form question holds the star rating, then look up its field key with their Typeform connection.
export const NAME_FIELD = "REPLACE_NAME_FIELD"; // Ask the user which form question holds the reviewer's name, then look up its field key with their Typeform connection.
export const EMAIL_FIELD = "REPLACE_EMAIL_FIELD"; // Ask the user which form question holds the reviewer's email, then look up its field key with their Typeform connection. The review endpoint matches reviewers on it.
export const REVIEW_ENDPOINT_URL = "REPLACE_REVIEW_ENDPOINT_URL"; // Ask the user for the POST URL of their review platform's endpoint that accepts new reviews. It is their own system's address, so it can't be looked up.
export const PRODUCT_ID = "REPLACE_PRODUCT_ID"; // Ask the user which product identifier their review platform uses for this product.
