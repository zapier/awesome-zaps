// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const QUALIFYING_PRODUCT_ID = "REPLACE_QUALIFYING_PRODUCT_ID"; // Shopify product ID that qualifies a paid order for provisioning.
export const USER_API_URL = "REPLACE_USER_API_URL"; // User management API endpoint that receives the user record (POST, JSON).

// Access status sent with each user record. New users default to active.
export const ACCESS_STATUS = "active";
