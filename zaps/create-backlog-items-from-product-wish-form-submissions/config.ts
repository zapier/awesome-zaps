// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const FORM_ID = "REPLACE_FORM_ID"; // Ask the user which Google Form collects the wishes, then look up its ID (the long ID in the form's URL) with their Google Forms connection. The trigger watches this form.
export const INTAKE_URL = "REPLACE_INTAKE_URL"; // Ask the user for the intake endpoint URL that receives each backlog item as JSON.
export const PRODUCT_CONTEXT = "REPLACE_PRODUCT_CONTEXT"; // Ask the user for the product or area label sent with every item.

// Form field keys for the submission. Check them against a real response before use.
export const EMAIL_FIELD = "email";
export const TITLE_FIELD = "title";
export const DESCRIPTION_FIELD = "description";
export const CONSENT_FIELD = "consent";
