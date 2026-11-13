// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const PO_TABLE_ID = "REPLACE_PO_TABLE_ID"; // Zapier Tables table ID of the central PO register (the long ID in the table's URL).
export const QBO_ITEM_ID = "REPLACE_QBO_ITEM_ID"; // QuickBooks Online product/service ID each purchase order line is booked against.
export const PROCUREMENT_EMAIL = "REPLACE_PROCUREMENT_EMAIL"; // Mailbox that gets a note when no PO row or vendor matches, and that receipts go to.

// Table field keys: f1 = PO number, f2 = vendor name, f3 = amount, f4 = description, f5 = status.
export const PO_NUMBER_FIELD = "f1";
export const VENDOR_NAME_FIELD = "f2";
export const AMOUNT_FIELD = "f3";
export const DESCRIPTION_FIELD = "f4";
export const STATUS_FIELD = "f5";
