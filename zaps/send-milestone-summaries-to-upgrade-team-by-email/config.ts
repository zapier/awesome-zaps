import { ask } from "zap-pack";

export const CALENDAR_ID = ask(
  "Google Calendar the trigger watches (set in the trigger configuration; not read by this code).",
);
export const UPGRADE_EMAIL = ask(
  "Address the milestone summaries are emailed to. Must be the connected Gmail account's own address.",
);
