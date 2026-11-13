// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which Zapier Tables table to watch for new rows, then look up its ID with their Zapier Tables connection (the table ID in the table's URL).
export const DEFAULT_CUSTOMER_NAME = "REPLACE_DEFAULT_CUSTOMER_NAME"; // Ask the user which QuickBooks customer to use when a row has no customer, then look up its name with their QuickBooks connection.
export const DEFAULT_VENDOR_NAME = "REPLACE_DEFAULT_VENDOR_NAME"; // Ask the user which QuickBooks vendor to use when a row has no vendor, then look up its name with their QuickBooks connection.
export const BANK_ACCOUNT_ID = "REPLACE_BANK_ACCOUNT_ID"; // Ask the user which bank or credit account expenses are paid from, then look up its ID with their QuickBooks connection.
export const EXPENSE_ACCOUNT_ID = "REPLACE_EXPENSE_ACCOUNT_ID"; // Ask the user which expense account each expense is booked to, then look up its ID with their QuickBooks connection.

// Document Type value (lowercase) that creates a QuickBooks invoice.
export const INVOICE_DOCUMENT_TYPE = "invoice";
// Document Type value (lowercase) that creates a QuickBooks expense.
export const EXPENSE_DOCUMENT_TYPE = "expense";
// How expenses were paid: "Cash", "Check" or "CreditCard".
export const EXPENSE_PAYMENT_TYPE = "CreditCard";
