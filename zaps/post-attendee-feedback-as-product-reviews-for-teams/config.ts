// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const TITLE_FIELD = "REPLACE_TITLE_FIELD"; // Typeform field key for the review title. Copy it from a sample entry's output.
export const BODY_FIELD = "REPLACE_BODY_FIELD"; // Typeform field key for the review text.
export const RATING_FIELD = "REPLACE_RATING_FIELD"; // Typeform field key for the star rating.
export const NAME_FIELD = "REPLACE_NAME_FIELD"; // Typeform field key for the reviewer's name.
export const EMAIL_FIELD = "REPLACE_EMAIL_FIELD"; // Typeform field key for the reviewer's email. The review endpoint matches reviewers on it.
export const REVIEW_ENDPOINT_URL = "REPLACE_REVIEW_ENDPOINT_URL"; // Review platform endpoint that accepts new reviews (a POST URL).
export const PRODUCT_ID = "REPLACE_PRODUCT_ID"; // Product identifier sent with every review.
