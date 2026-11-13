// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const XERO_ORGANIZATION = "REPLACE_XERO_ORGANIZATION"; // Xero organization whose invoices are watched (the trigger's Organization field).
export const CARTONCLOUD_TENANT = "REPLACE_CARTONCLOUD_TENANT"; // CartonCloud tenant the outbound orders are created in.
export const CARTONCLOUD_CUSTOMER = "REPLACE_CARTONCLOUD_CUSTOMER"; // CartonCloud customer the outbound orders are raised against.
export const IT_ALERT_EMAIL = "REPLACE_IT_ALERT_EMAIL"; // Gmail address that receives failure notices. Use an address you can read.
