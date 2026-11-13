// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Zapier Tables table to watch for new rows (the table ID in the table's URL).
export const DEFAULT_CUSTOMER_NAME = "REPLACE_DEFAULT_CUSTOMER_NAME"; // Customer name used when the row has no customer.
export const DEFAULT_VENDOR_NAME = "REPLACE_DEFAULT_VENDOR_NAME"; // Vendor name used when the row has no vendor.
export const BANK_ACCOUNT_ID = "REPLACE_BANK_ACCOUNT_ID"; // QuickBooks ID of the bank or credit account expenses are paid from.
export const EXPENSE_ACCOUNT_ID = "REPLACE_EXPENSE_ACCOUNT_ID"; // QuickBooks ID of the expense account each expense is booked to.

// Document Type value (lowercase) that creates a QuickBooks invoice.
export const INVOICE_DOCUMENT_TYPE = "invoice";
// Document Type value (lowercase) that creates a QuickBooks expense.
export const EXPENSE_DOCUMENT_TYPE = "expense";
// How expenses were paid: "Cash", "Check" or "CreditCard".
export const EXPENSE_PAYMENT_TYPE = "CreditCard";
