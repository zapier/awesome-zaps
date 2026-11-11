import { ask } from "zap-pack";

export const ORDERS_WEBHOOK_URL = ask(
  "Endpoint that receives each new sales order (your ERP/CRM Orders endpoint). Anyone with this URL can create orders.",
);
export const ORDER_LINES_WEBHOOK_URL = ask(
  "Endpoint that receives each sales-order line and the discount line (your ERP/CRM sales-order-lines endpoint).",
);
