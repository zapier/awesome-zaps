// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const PO_TABLE_ID = "REPLACE_PO_TABLE_ID"; // Ask the user which Zapier Tables table is the central PO register, then look up its ID (the long ID in the table's URL) with their Zapier Tables connection.
export const QBO_ITEM_ID = "REPLACE_QBO_ITEM_ID"; // Ask the user which QuickBooks product or service each purchase order line is booked against, then look up its ID with their QuickBooks connection.
export const PROCUREMENT_EMAIL = "REPLACE_PROCUREMENT_EMAIL"; // Ask the user which mailbox gets a note when no PO row or vendor matches, and where suppliers should send receipts.

// Table field keys: f1 = PO number, f2 = vendor name, f3 = amount, f4 = description, f5 = status.
export const PO_NUMBER_FIELD = "f1";
export const VENDOR_NAME_FIELD = "f2";
export const AMOUNT_FIELD = "f3";
export const DESCRIPTION_FIELD = "f4";
export const STATUS_FIELD = "f5";
