// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const ROUTING_WEBHOOK_URL = "REPLACE_ROUTING_WEBHOOK_URL"; // Catch-hook URL of the reusable routing workflow that updates the contact group.

// Rotation identifier sent when the event summary matches no known rotation.
export const FALLBACK_ROTATION = "default";
