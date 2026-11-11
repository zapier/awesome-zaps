// Optional, webhook path only: a URL that returns the invoice's current status as JSON
// (e.g. {"balance": 0} or {"status": "paid"}). "{invoice}" is replaced with the invoice id or number.
// Leave empty to use the status the webhook sent (or send status_url in the payload).
export const STATUS_CHECK_URL = "";
