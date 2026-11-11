import { ask } from "zap-pack";

export const REQUESTER_NAME = ask(
  "Name of the service account the ticket is requested by (Zendesk requester name).",
);
export const REQUESTER_EMAIL = ask(
  "Email of that service account (Zendesk requester email).",
);
// Ticket priority: "urgent", "high", "normal" or "low".
export const TICKET_PRIORITY = "normal";
// Ticket type: "problem", "incident", "question" or "task".
export const TICKET_TYPE = "incident";
// Comma-separated tags added to every ticket.
export const TICKET_TAGS = "crawl-health,monitoring,daily-check";
// Whether the checklist comment is public to the requester: "yes" or "no".
export const FIRST_COMMENT_PUBLIC = "no";
