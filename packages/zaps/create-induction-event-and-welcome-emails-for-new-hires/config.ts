import { ask } from "zap-pack";

export const TABLE_ID = ask(
  "Zapier Tables table ID that holds the new-hire records. Also set this as the table in the trigger.",
);
export const HR_CALENDAR_ID = ask(
  "Google Calendar ID of the HR calendar that the induction event is created on.",
);
export const HR_COORDINATOR_EMAIL = ask(
  "HR coordinator address, CC'd on the welcome email to the new hire.",
);
export const IT_EMAIL = ask(
  "IT address: receives the internal provisioning email and is invited to the induction event.",
);
export const LICENSE_OWNERS_EMAIL = ask(
  "License owners address: receives the internal provisioning email.",
);
// Field keys on the Zapier Tables record, as they appear in the trigger payload.
export const NAME = "f1";
export const EMAIL = "f2";
export const START_DATE = "f3";
export const INDUCTION_LINK = "f4";
export const HIRING_MANAGER_EMAIL = "f5";
export const INVITED_AT = "f6";
