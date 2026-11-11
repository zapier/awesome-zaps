import { ask } from "zap-pack";

export const ONBOARDING_CHANNEL_ID = ask(
  "Slack channel ID of the onboarding channel where account owners are notified.",
);
// Reminder appended to the Slack message for the people who provision accounts and tools.
export const PROVISIONING_REMINDER =
  "Owners: please finish provisioning laptop, apps and access before day one.";
export const ONBOARDING_CALENDAR_ID = ask(
  "Google Calendar ID of the calendar that holds the recurring onboarding sessions.",
);
// Text that onboarding session titles or descriptions contain, used when the location has no entry in workflow.ts.
export const DEFAULT_SESSION_SEARCH_TERM = "New Hire Onboarding";
