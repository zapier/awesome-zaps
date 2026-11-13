// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const XERO_ORGANIZATION = "REPLACE_XERO_ORGANIZATION"; // Look up with the user's Xero connection the organization that holds the invoices, then use its ID. Must match the trigger's organization.
export const CARTONCLOUD_TENANT = "REPLACE_CARTONCLOUD_TENANT"; // Look up with the user's CartonCloud connection the tenant the orders are created in.
export const CARTONCLOUD_CUSTOMER = "REPLACE_CARTONCLOUD_CUSTOMER"; // Look up with the user's CartonCloud connection the customer the orders are raised against.
export const IT_ALERT_EMAIL = "REPLACE_IT_ALERT_EMAIL"; // Ask the user which address gets failure notices, then use it. It must be one they can read.
