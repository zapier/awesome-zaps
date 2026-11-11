import { ask } from "zap-pack";

export const CALLS_TABLE_ID = ask(
  "Zapier Tables table of temporary call records. Its ID is in the table's URL.",
);
// Column in the Calls table that holds the normalized caller phone number.
export const PHONE_FIELD = "phone";
// Column in the Calls table that holds the HubSpot ticket ID for the call.
export const TICKET_REFERENCE_FIELD = "ticket_reference";
export const ALERT_EMAIL = ask(
  "Address that receives an alert when a call has no ticket. Use an address you read.",
);
