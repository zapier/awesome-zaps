import { ask } from "zap-pack";

export const WORKSPACE_ID = ask(
  "Jotform Enterprise workspace ID that holds the partner form and the internal intake forms.",
);
export const INTAKE_FORM_ID = ask(
  "Internal intake form that each partner submission is copied into.",
);
// Optional secondary intake form for a separate review queue. Leave empty to skip it.
export const SECONDARY_INTAKE_FORM_ID = "";
