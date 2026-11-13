---
name: create-invoices-and-expenses-from-new-table-rows
description: Build a Zap on Zapier that turns each new row in a Zapier Tables table into a QuickBooks Online invoice or expense, skipping rows that already exist in QuickBooks, so accounts payable and receivable entries are created without retyping. Use when bills, invoices or expense receipts are logged in a table and should land in QuickBooks as records for finance review.
license: MIT
metadata:
  author: zapier
  summary: "Each new row in your invoice table becomes a QuickBooks invoice or expense, so bookkeeping entries are created without retyping and duplicates are skipped."
  apps: "Zapier Tables, QuickBooks Online"
  category: "Finance"
  job: "Accounts payable"
  source: "https://zapier.com/automations/finance/accounts-payable/invoice-processing-management/create-invoices-and-expenses-from-new-table-rows"
---

# Create invoices and expenses from new table rows

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-invoices-and-expenses-from-new-table-rows. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new record is added to a Zapier Tables table (`zapier-tables`, `new_record`). One row per invoice, bill or expense.
2. **Filter:** the row's Document Type must be `invoice` or `expense`. Anything else, such as a credit, stops the run.
3. **Wait:** a short pause (2 minutes by default) so upstream systems finish writing the row.
4. **QuickBooks search:** QuickBooks Online is searched for an existing invoice (by invoice number) or expense (by document number). If one exists, the run stops.
5. **QuickBooks create:** a new invoice or expense is created from the row's number, date, amount, line details and tracking reference. Invoices are created unsent so finance can review them, and nothing is sent to a customer.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                 | What goes there                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `TABLE_ID`              | The Zapier Tables table that holds the rows. The trigger watches this same table        |
| `DEFAULT_CUSTOMER_NAME` | The QuickBooks customer used when a row has no customer; look it up so the name matches |
| `DEFAULT_VENDOR_NAME`   | The QuickBooks vendor used when a row has no vendor; look it up so the name matches     |
| `BANK_ACCOUNT_ID`       | The QuickBooks bank or credit account expenses are paid from                            |
| `EXPENSE_ACCOUNT_ID`    | The QuickBooks expense account each expense is booked to                                |

Also review the defaults with them: `SETTLE_SECONDS` in `workflow.ts` (`120`; `0` skips the wait), `INVOICE_DOCUMENT_TYPE` and `EXPENSE_DOCUMENT_TYPE` (`invoice` and `expense`, compared lowercase), and `EXPENSE_PAYMENT_TYPE` (`CreditCard`, or `Cash` or `Check`).

Ask which columns of the table hold the document number, document type, total amount, transaction date, line details, tracking reference, and customer or vendor name. Map them, in that order, to `f1` through `f7` in the row data.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `quickbooks` (the company file that should receive the records) to the user's QuickBooks Online connection. The trigger's `zapier-tables` account (the one that owns the table) is set in step 2.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-record.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. Set the trigger's table to `TABLE_ID`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test, with a document number that does not exist in QuickBooks yet, against a QuickBooks test company:

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
  "record_id": "sample-record-1"
}
```

Check that:

- A new invoice `INV-1001` exists in QuickBooks for the sample customer, dated 2026-10-29, for 12.50, with the line details and reference filled in.
- It is unsent.
- Running the same sample again does not create a second invoice.
- A row with Document Type `credit` returns `not-billable-document-type` and creates nothing.

If run-status tools aren't available, check the result in QuickBooks directly. Then ask the user to delete the test invoice from QuickBooks; the agent does not delete test data. Publish only after the test passes, and confirm the trigger is active.

## Notes

- QuickBooks invoices have no draft state. They are created unsent, which is how this Zap holds them for review.
- Each row becomes a single line item. Multi-line bills are not split.
- The customer or vendor is matched by exact display name. A row whose name does not match falls back to the default name; if that is also missing, the run stops and writes nothing.
- Expenses need a bank or credit account and an expense account. Set both before publishing.
- To extend it: create a credit memo for `credit` rows instead of skipping them, or add a notification step to your team channel for records above a set amount.
