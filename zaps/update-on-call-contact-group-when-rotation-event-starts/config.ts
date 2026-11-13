// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const ROUTING_WEBHOOK_URL = "REPLACE_ROUTING_WEBHOOK_URL"; // Ask the user for the catch-hook URL of the routing workflow that updates the contact group.
export const DEFAULT_CONTACTS = ["REPLACE_DEFAULT_CONTACT_EMAIL"]; // Ask the user who is in the default contact set, as email addresses. Sent as the group members and as the fallback contacts.

// Rotation identifier sent when the event summary matches no known rotation.
export const FALLBACK_ROTATION = "default";
