---
name: create-invoices-and-expenses-from-new-table-rows
description: Build a Zapier Next Gen Zap that turns each new row in a Zapier Tables table into a QuickBooks Online invoice or expense, skipping rows that already exist in QuickBooks, so accounts payable and receivable entries are created without retyping. Use when bills, invoices or expense receipts are logged in a table and should land in QuickBooks as records for finance review.
metadata:
  author: zapier
  summary: "Each new row in your invoice table becomes a QuickBooks invoice or expense, so bookkeeping entries are created without retyping and duplicates are skipped."
  apps: "Zapier Tables, QuickBooks Online"
  category: "Finance"
  job: "Accounts payable"
  source: "https://zapier.com/automations/finance/accounts-payable/invoice-processing-management/create-invoices-and-expenses-from-new-table-rows"
---

# Create invoices and expenses from new table rows

## What it does

1. **Trigger:** a new record is added to a Zapier Tables table (one row per invoice, bill or expense).
2. **Filter:** the row's Document Type must be `invoice` or `expense`. Anything else, such as a credit, is skipped.
3. **Wait:** a short pause (2 minutes by default) so upstream systems finish writing the row.
4. **Search:** QuickBooks Online is searched for an existing invoice (by invoice number) or expense (by document number). If one exists, the run stops.
5. **Create:** a new QuickBooks invoice or expense is created from the row's number, date, amount, line details and tracking reference. Invoices are left unsent so finance can review them.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Zapier Tables, New Record (`zapier-tables`, `new_record`). Set the trigger's table to your table. `TABLE_ID` at the top of `workflow.ts` records the same table ID, so keep them equal.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: your Zapier Tables connection, for the account that owns the table.
   - `quickbooks`: your QuickBooks Online connection, for the company file that should receive the records.
3. **Constants** (each has a comment in `workflow.ts`):
   - `TABLE_ID`: the table ID, the same one set on the trigger.
   - `SETTLE_SECONDS`: the wait before the search. Defaults to `120`. Use `0` to skip it.
   - `INVOICE_DOCUMENT_TYPE` and `EXPENSE_DOCUMENT_TYPE`: the Document Type values that route a row. Defaults are `invoice` and `expense`, compared lowercase.
   - `DEFAULT_CUSTOMER_NAME` and `DEFAULT_VENDOR_NAME`: the names used when a row has no customer or vendor.
   - `BANK_ACCOUNT_ID`: the QuickBooks bank or credit account that expenses are paid from.
   - `EXPENSE_ACCOUNT_ID`: the QuickBooks expense account each expense is booked to.
   - `EXPENSE_PAYMENT_TYPE`: `Cash`, `Check` or `CreditCard`. Defaults to `CreditCard`.
4. Test with the steps below, then publish, and check that the trigger is active.

## Ask the user

- Which Zapier Tables table holds the rows, and which columns hold the document number, document type, total amount, transaction date, line details, tracking reference, customer or vendor name, and status?
- Which QuickBooks customer and vendor should be used when a row has none?
- Which QuickBooks bank or credit account pays expenses, and which expense account should they be booked to?
- How were expenses paid (`Cash`, `Check` or `CreditCard`)?

## Test

Run this sample as a test run with a document number that does not exist in QuickBooks yet, against a QuickBooks test company:

```json
{
  "new": {
    "data": {
      "f1": "INV-1001",
      "f2": "invoice",
      "f3": 12.5,
      "f4": "2026-10-29T13:00:00Z",
      "f5": "Sample line item",
      "f6": "REF-1001",
      "f7": "Sample Customer",
      "f8": "new"
    }
  },
  "record_id": "YOUR_RECORD_ID",
  "table_id": "YOUR_TABLE_ID"
}
```

Check that:

- A new invoice `INV-1001` exists in QuickBooks for the sample customer, dated 2026-10-29, for 12.50, with the line details and reference filled in.
- It is unsent.
- Running the same sample again does not create a second invoice.
- A row with Document Type `credit` returns `not-billable-document-type` and creates nothing.

Then remove the test records from QuickBooks if they were real data.

## Customize

- **Credit memos or refunds:** add a path that creates a credit memo for `credit` rows instead of skipping them.
- **High-value alerts:** add a notification step to your team channel when a record above a set amount is created.

## Notes

- QuickBooks invoices have no draft state. They are created unsent, which is how this workflow holds them for review.
- Each row becomes a single line item. Multi-line bills are not split.
- The customer or vendor is matched by exact display name. A row whose name does not match falls back to the default name; if that is also missing, the run stops and writes nothing.
- Expenses need a bank or credit account and an expense account. Both IDs come from your QuickBooks company, so set them before publishing.
