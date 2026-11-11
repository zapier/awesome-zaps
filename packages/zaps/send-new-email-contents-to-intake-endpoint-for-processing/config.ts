import { ask } from "zap-pack";

export const INTAKE_ENDPOINT_URL = ask(
  "URL of the intake endpoint that receives each email as JSON for processing.",
);
