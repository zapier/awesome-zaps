// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const REQUESTER_NAME = "REPLACE_REQUESTER_NAME"; // Look up with the user's Zendesk connection the service account the tickets are requested by, then take its name.
export const REQUESTER_EMAIL = "REPLACE_REQUESTER_EMAIL"; // Look up with the user's Zendesk connection the email of that same service account.

// Ticket priority: "urgent", "high", "normal" or "low".
export const TICKET_PRIORITY = "normal";
// Ticket type: "problem", "incident", "question" or "task".
export const TICKET_TYPE = "incident";
// Comma-separated tags added to every ticket.
export const TICKET_TAGS = "crawl-health,monitoring,daily-check";
// Whether the checklist comment is public to the requester: "yes" or "no".
export const FIRST_COMMENT_PUBLIC = "no";
