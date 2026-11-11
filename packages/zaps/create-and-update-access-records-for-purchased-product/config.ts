import { ask } from "zap-pack";

export const QUALIFYING_PRODUCT_ID = ask(
  "Shopify product ID that qualifies a paid order for provisioning.",
);
export const USER_API_URL = ask(
  "User management API endpoint that receives the user record (POST, JSON).",
);
// Access status sent with each user record. New users default to active.
export const ACCESS_STATUS = "active";
