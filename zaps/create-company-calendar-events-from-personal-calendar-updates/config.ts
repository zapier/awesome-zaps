import { ask } from "zap-pack";

export const COMPANY_CALENDAR_ID = ask(
  "Google Calendar ID of the company calendar that receives the mirrored events.",
);
// Line added to each mirrored event's description, followed by the source event ID.
// The company copy is found on later updates by searching for this marker.
export const MIRROR_MARKER = "Mirrored from personal calendar event";
