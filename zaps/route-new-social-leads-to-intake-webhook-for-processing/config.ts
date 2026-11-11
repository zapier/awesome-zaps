import { ask } from "zap-pack";

export const INTAKE_WEBHOOK_URL = ask(
  "Intake endpoint that receives the normalized lead JSON (a Webhooks by Zapier catch hook or your own URL).",
);
