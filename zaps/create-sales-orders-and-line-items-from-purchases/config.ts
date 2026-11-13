// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const ORDERS_WEBHOOK_URL = "REPLACE_ORDERS_WEBHOOK_URL"; // Ask the user for the URL of their ERP or CRM endpoint that receives each new sales order. Anyone with this URL can create orders.
export const ORDER_LINES_WEBHOOK_URL = "REPLACE_ORDER_LINES_WEBHOOK_URL"; // Ask the user for the URL of their ERP or CRM endpoint that receives each sales-order line, including the discount line.
