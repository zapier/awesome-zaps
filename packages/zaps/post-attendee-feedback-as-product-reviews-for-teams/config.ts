import { ask } from "zap-pack";

export const TITLE_FIELD = ask(
  "Typeform field key for the review title. Copy it from a sample entry's output.",
);
export const BODY_FIELD = ask("Typeform field key for the review text.");
export const RATING_FIELD = ask("Typeform field key for the star rating.");
export const NAME_FIELD = ask("Typeform field key for the reviewer's name.");
export const EMAIL_FIELD = ask(
  "Typeform field key for the reviewer's email. The review endpoint matches reviewers on it.",
);
export const REVIEW_ENDPOINT_URL = ask(
  "Review platform endpoint that accepts new reviews (a POST URL).",
);
export const PRODUCT_ID = ask("Product identifier sent with every review.");
