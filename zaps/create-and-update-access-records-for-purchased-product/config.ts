// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const QUALIFYING_PRODUCT_ID = "REPLACE_QUALIFYING_PRODUCT_ID"; // Ask the user which Shopify product qualifies a paid order for provisioning, then look up its ID with their Shopify connection.
export const USER_API_URL = "REPLACE_USER_API_URL"; // Ask the user for the endpoint of their user management API that receives the user record, by POST as JSON.

// Access status sent with each user record. New users default to active.
export const ACCESS_STATUS = "active";
