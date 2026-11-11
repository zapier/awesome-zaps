import { ask } from "zap-pack";

export const FORM_ID = ask(
  "Google Form ID (the long ID in the form's URL). The trigger watches this form.",
);
export const INTAKE_URL = ask(
  "Intake endpoint that receives each backlog item as JSON.",
);
export const PRODUCT_CONTEXT = ask(
  "Product or context label sent with every item.",
);
// Form field keys for the submission. Check them against a real response before use.
export const EMAIL_FIELD = "email";
export const TITLE_FIELD = "title";
export const DESCRIPTION_FIELD = "description";
export const CONSENT_FIELD = "consent";
