import { ask } from "zap-pack";

export const HR_WEBHOOK_URL = ask(
  "HR system endpoint that creates the training record (Webhooks by Zapier POST target).",
);
