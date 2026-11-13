---
name: create-dispatch-orders-from-zero-paid-invoices-for-ops
description: Build a Zap on Zapier that watches Xero for paid sales invoices with a zero or near-zero total and creates a matching outbound order in CartonCloud, emailing IT when the order fails. Use when a sales team raises invoices that need no payment (free samples, credits, promo orders) and the warehouse still has to ship them, so ops doesn't re-key each one.
license: MIT
metadata:
  author: zapier
  summary: "When an invoice is paid at zero or near-zero, the matching dispatch order is created in your warehouse system automatically, and IT is emailed if that fails."
  apps: "Xero, CartonCloud, Gmail"
  category: "Sales"
  job: "Sales operations"
  source: "https://zapier.com/automations/sales/sales-operations/sales-order-processing/create-dispatch-orders-from-zero-paid-invoices-for-ops"
---

# Create dispatch orders from zero-paid invoices

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-dispatch-orders-from-zero-paid-invoices-for-ops. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Xero sales invoice is updated to status `paid` (`xero`, `updated_invoice_v2`).
2. **Filter (plain code):** the run stops unless the invoice is paid and its total is between 0 and `MAX_INVOICE_TOTAL`. Invoices whose reference contains a configured branch indicator are skipped.
3. **CartonCloud** creates an outbound (sale) order. The invoice number is the order reference. The contact name and address lines go to the delivery address, each invoice line becomes an item (product code and quantity), and the invoice PDF is attached when Xero provides one.
4. **Gmail:** if the CartonCloud step fails, one failure notice goes to the IT address with the invoice number and the error.

The Zap only creates orders and sends the IT notice. It never changes the invoice in Xero.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                        | Where                                                                           | What goes there                                                               |
| ------------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `REPLACE_XERO_ORGANIZATION`    | `config.ts`, `XERO_ORGANIZATION`; `triggers/updated-invoice.ts`, `organization` | The Xero organization whose invoices are watched. Use the same value in both. |
| `REPLACE_CARTONCLOUD_TENANT`   | `config.ts`, `CARTONCLOUD_TENANT`                                               | The CartonCloud tenant the orders are created in                              |
| `REPLACE_CARTONCLOUD_CUSTOMER` | `config.ts`, `CARTONCLOUD_CUSTOMER`                                             | The CartonCloud customer the orders are raised against                        |
| `REPLACE_IT_ALERT_EMAIL`       | `config.ts`, `IT_ALERT_EMAIL`                                                   | The address that receives failure notices. Use one they can read.             |

Also review the defaults with them:

- `MAX_INVOICE_TOTAL` (`1`): the largest total that counts as zero or near-zero.
- `SKIP_BRANCH_INDICATORS` (empty, so nothing is skipped): reference words that mark a branch invoice to skip. If they have any, list them.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `cartoncloud` (the warehouse account that creates the orders) and `gmail` (sends the IT notices) to the user's connections, and `xero` (the trigger's account, for the organization being watched) to the user's Xero connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-invoice.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with this invoice. Every value is a placeholder:

```json
{
  "invoice": {
    "InvoiceNumber": "INV-0001",
    "InvoiceID": "<invoice-id>",
    "Reference": "Free sample pack",
    "Status": "PAID",
    "Total": "0.00",
    "CurrencyCode": "AUD",
    "InvoicePDF": "https://example.com/INV-0001.pdf",
    "LineItems": [{ "ItemCode": "SAMPLE-01", "Quantity": 2 }],
    "Contact": {
      "Name": "Example Customer",
      "Address": {
        "AddressLine1": "1 Example Street",
        "City": "Sydney",
        "PostalCode": "2000",
        "Region": "NSW"
      },
      "Address_POBOX": { "AddressLine1": "PO Box 1" }
    }
  }
}
```

Check that one outbound order appears in CartonCloud with order reference `INV-0001`, the right address and item, and the invoice PDF attached. Then run it again with `"Total": "250.00"` and check that no order is created. Then run it with a broken CartonCloud connection, if you can, and check that the IT address gets one failure notice.

If run-status tools aren't available, check the result in CartonCloud and Gmail directly. Then publish, and confirm the trigger is active. Ask the user to delete any test order in CartonCloud; the agent doesn't delete test data.

## Notes

- The Zap creates an order on every paid invoice update, and the workflow doesn't look up orders it already created. Check CartonCloud for an existing order before relying on this in production.
- Xero can take a few minutes to record an update, so a zero-paid invoice may dispatch a few minutes after it is marked paid.
- To swap the warehouse system, replace CartonCloud with any app that can create an outbound order. To swap the alert, use an SMS or team chat message instead of Gmail.
- Never commit a real Xero organization ID, CartonCloud tenant, or email address.
