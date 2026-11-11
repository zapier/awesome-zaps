import { ask } from "zap-pack";

// Subject prefix for each ticket; the run month (YYYY-MM) is added after it.
export const TICKET_SUBJECT_PREFIX = "Monthly policy admin review";
// Zendesk ticket type for the policy/admin queue: problem, incident, question or task.
export const TICKET_TYPE = "task";
export const SUPPORT_QUEUE_GROUP_ID = ask(
  "Zendesk group ID of the policy support queue (the numeric ID from Zendesk, as a string).",
);
// Tag added to each ticket so the monthly tickets can be found for the audit trail.
export const AUDIT_TAG = "compliance-monthly-review";
