// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const WORKSPACE_ID = "REPLACE_WORKSPACE_ID"; // Ask the user which Jotform workspace holds the partner form and the internal intake forms, then look up its ID with their Jotform Enterprise connection.
export const INTAKE_FORM_ID = "REPLACE_INTAKE_FORM_ID"; // Ask the user which form is the internal intake form that each partner submission is copied into, then look up its ID with their Jotform Enterprise connection.

// Optional secondary intake form for a separate review queue. Leave empty to skip it.
export const SECONDARY_INTAKE_FORM_ID = "";
