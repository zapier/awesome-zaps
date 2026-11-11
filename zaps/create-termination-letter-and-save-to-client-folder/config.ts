import { ask } from "zap-pack";

export const TEMPLATE_DOC_ID = ask(
  "Google Docs template to copy (the document ID from its URL).",
);
// Start of the new document's name; the practice, provider and time are appended.
export const TITLE_PREFIX = "Termination letter";
