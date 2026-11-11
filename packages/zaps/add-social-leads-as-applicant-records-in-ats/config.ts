import { ask } from "zap-pack";

export const ATS_WEBHOOK_URL = ask(
  "Your applicant tracking system's webhook URL, which accepts applicant records as JSON.",
);
export const INTAKE_STAGE = ask(
  "Stage that sourced applicants are assigned to on creation.",
);
// Source tag written to every applicant record.
export const SOURCE_TAG = "Facebook Lead Ads";
