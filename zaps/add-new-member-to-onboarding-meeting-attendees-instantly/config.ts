import { ask } from "zap-pack";

export const ONBOARDING_EVENT_TITLE = ask(
  "Title of the onboarding meeting, exactly as it appears in Outlook.",
);
export const ONBOARDING_WINDOW_START = ask(
  "Start of the window to search for that meeting (ISO 8601 with offset).",
);
export const ONBOARDING_WINDOW_END = ask(
  "End of the window to search for that meeting (ISO 8601 with offset).",
);
// Outlook calendar ID to search. Leave empty for the connected account's default calendar.
export const CALENDAR_ID = "";
