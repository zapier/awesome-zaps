// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const FORM_ID = "REPLACE_FORM_ID"; // Google Form ID (the long ID in the form's URL). The trigger watches this form.
export const INTAKE_URL = "REPLACE_INTAKE_URL"; // Intake endpoint that receives each backlog item as JSON.
export const PRODUCT_CONTEXT = "REPLACE_PRODUCT_CONTEXT"; // Product or context label sent with every item.

// Form field keys for the submission. Check them against a real response before use.
export const EMAIL_FIELD = "email";
export const TITLE_FIELD = "title";
export const DESCRIPTION_FIELD = "description";
export const CONSENT_FIELD = "consent";
