// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const OWNER_EMAIL = "REPLACE_OWNER_EMAIL"; // Ask the user which email gets the reply drafts (the address they read).
export const TESTIMONIAL_SHEET_ID = "REPLACE_TESTIMONIAL_SHEET_ID"; // Ask the user which sheet is the "Testimonial Tuesday" sheet, then look up its ID with their Google Sheets connection.
// How replies should sound. Edit this to match the owner.
export const OWNER_VOICE =
  "Warm, plain-spoken small business owner. First person. Short sentences. Grateful but not gushing. No corporate phrases.";
// The tab inside that sheet; "0" is the first tab. Change it only if the user picks another.
export const TESTIMONIAL_WORKSHEET_ID = "0";
