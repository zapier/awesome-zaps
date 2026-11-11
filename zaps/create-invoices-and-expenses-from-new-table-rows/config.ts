import { ask } from "zap-pack";

export const TABLE_ID = ask(
  "Zapier Tables table to watch for new rows (the table ID in the table's URL).",
);
// Document Type value (lowercase) that creates a QuickBooks invoice.
export const INVOICE_DOCUMENT_TYPE = "invoice";
// Document Type value (lowercase) that creates a QuickBooks expense.
export const EXPENSE_DOCUMENT_TYPE = "expense";
export const DEFAULT_CUSTOMER_NAME = ask(
  "Customer name used when the row has no customer.",
);
export const DEFAULT_VENDOR_NAME = ask(
  "Vendor name used when the row has no vendor.",
);
export const BANK_ACCOUNT_ID = ask(
  "QuickBooks ID of the bank or credit account expenses are paid from.",
);
export const EXPENSE_ACCOUNT_ID = ask(
  "QuickBooks ID of the expense account each expense is booked to.",
);
// How expenses were paid: "Cash", "Check" or "CreditCard".
export const EXPENSE_PAYMENT_TYPE = "CreditCard";
