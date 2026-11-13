// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const ONBOARDING_CHANNEL_ID = "REPLACE_ONBOARDING_CHANNEL_ID"; // Slack channel ID of the onboarding channel where account owners are notified.
export const ONBOARDING_CALENDAR_ID = "REPLACE_ONBOARDING_CALENDAR_ID"; // Google Calendar ID of the calendar that holds the recurring onboarding sessions.

// Reminder appended to the Slack message for the people who provision accounts and tools.
export const PROVISIONING_REMINDER =
  "Owners: please finish provisioning laptop, apps and access before day one.";
// Text that onboarding session titles or descriptions contain, used when the location has no entry in workflow.ts.
export const DEFAULT_SESSION_SEARCH_TERM = "New Hire Onboarding";
