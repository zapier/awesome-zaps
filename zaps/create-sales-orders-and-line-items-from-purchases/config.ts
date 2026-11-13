// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const ORDERS_WEBHOOK_URL = "REPLACE_ORDERS_WEBHOOK_URL"; // Endpoint that receives each new sales order (your ERP/CRM Orders endpoint). Anyone with this URL can create orders.
export const ORDER_LINES_WEBHOOK_URL = "REPLACE_ORDER_LINES_WEBHOOK_URL"; // Endpoint that receives each sales-order line and the discount line (your ERP/CRM sales-order-lines endpoint).
