// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SUPPORT_QUEUE_GROUP_ID = "REPLACE_SUPPORT_QUEUE_GROUP_ID"; // Look up the policy support queue group with the user's Zendesk connection, then use its numeric ID as a string.

// Subject prefix for each ticket; the run month (YYYY-MM) is added after it.
export const TICKET_SUBJECT_PREFIX = "Monthly policy admin review";
// Zendesk ticket type for the policy/admin queue: problem, incident, question or task.
export const TICKET_TYPE = "task";
// Tag added to each ticket so the monthly tickets can be found for the audit trail.
export const AUDIT_TAG = "compliance-monthly-review";
