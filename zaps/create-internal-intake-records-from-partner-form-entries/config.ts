// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const WORKSPACE_ID = "REPLACE_WORKSPACE_ID"; // Jotform Enterprise workspace ID that holds the partner form and the internal intake forms.
export const INTAKE_FORM_ID = "REPLACE_INTAKE_FORM_ID"; // Internal intake form that each partner submission is copied into.

// Optional secondary intake form for a separate review queue. Leave empty to skip it.
export const SECONDARY_INTAKE_FORM_ID = "";
