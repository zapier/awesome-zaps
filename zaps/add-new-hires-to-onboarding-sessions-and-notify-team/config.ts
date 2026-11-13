// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const ONBOARDING_CHANNEL_ID = "REPLACE_ONBOARDING_CHANNEL_ID"; // Ask the user which Slack channel account owners are notified in, then look up its ID (C…) with their Slack connection.
export const ONBOARDING_CALENDAR_ID = "REPLACE_ONBOARDING_CALENDAR_ID"; // Ask the user which calendar holds the recurring onboarding sessions, then look up its ID with their Google Calendar connection.

// Reminder appended to the Slack message for the people who provision accounts and tools.
export const PROVISIONING_REMINDER =
  "Owners: please finish provisioning laptop, apps and access before day one.";
// Text that onboarding session titles or descriptions contain, used when the location has no entry in workflow.ts.
export const DEFAULT_SESSION_SEARCH_TERM = "New Hire Onboarding";
