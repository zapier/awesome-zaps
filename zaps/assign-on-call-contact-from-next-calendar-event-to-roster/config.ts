import { ask } from "zap-pack";

export const CALENDAR_ID = ask(
  "Google Calendar ID of the rotation calendar. The trigger watches it and this step updates its events.",
);
export const DEFAULT_CONTACT = ask(
  "Contact written when no rotation name in the event title matches ROSTER.",
);
// Label for the line written into the event description, so a re-run replaces it instead of adding another.
export const CONTACT_LABEL = "On call:";
