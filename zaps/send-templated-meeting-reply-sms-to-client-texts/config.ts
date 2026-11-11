import { ask } from "zap-pack";

export const BUSINESS_PHONE_NUMBER_ID = ask(
  'Quo phone number that replies are sent from (your business number). Find its ID with Quo\'s "List Phone Numbers" action.',
);
export const TEMPLATES_TABLE_ID = ask(
  'Zapier Table with the reply templates. Fields: identifier (the reply code, e.g. "1") and body (the SMS text).',
);
// Sent instead when no template matches a qualifying reply.
export const FALLBACK_REPLY = "Thanks for your reply. We'll follow up shortly.";
