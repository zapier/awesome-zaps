// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const DOWNSTREAM_WEBHOOK_URL = "REPLACE_DOWNSTREAM_WEBHOOK_URL"; // Ask the user for their billing workflow's catch-hook URL, the endpoint that receives each accepted estimate.

// QuickBooks estimate status that lets an estimate continue. Estimates in any other status are skipped.
export const ACCEPTED_STATUS = "Accepted";
// Separator between line items in the joined description and quantity strings.
export const LINE_DELIMITER = "; ";
