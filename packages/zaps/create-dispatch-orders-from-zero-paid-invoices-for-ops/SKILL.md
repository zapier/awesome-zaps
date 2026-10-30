---
name: create-dispatch-orders-from-zero-paid-invoices-for-ops
description: Build a Zapier Next Gen Zap that watches Xero for paid sales invoices with a zero or near-zero total and creates a matching outbound order in CartonCloud, emailing IT when the order fails. Use when a sales team raises invoices that need no payment (free samples, credits, promo orders) and the warehouse still has to ship them, so ops doesn't re-key each one.
metadata:
  author: zapier
  summary: "When an invoice is paid at zero or near-zero, the matching dispatch order is created in your warehouse system automatically, and IT is emailed if that fails."
  apps: "Xero, CartonCloud, Gmail"
  category: "Sales"
  job: "Sales operations"
  source: "https://zapier.com/automations/sales/sales-operations/sales-order-processing/create-dispatch-orders-from-zero-paid-invoices-for-ops"
---

# Create dispatch orders from zero-paid invoices

## What it does

1. **Trigger:** a Xero sales invoice is updated to status `paid` (Xero's "Updated Sales Invoice" trigger).
2. **Filter (plain code):** the run stops unless the invoice is paid and its total is between 0 and the threshold (`MAX_INVOICE_TOTAL`). Invoices whose reference contains a configured branch indicator are skipped.
3. **CartonCloud** creates an outbound (sale) order. The invoice number is the order reference. The contact name and address lines go to the delivery address, each invoice line becomes an item (product code and quantity), and the invoice PDF is attached when Xero provides one.
4. **Gmail:** if the CartonCloud step fails, one failure notice goes to the IT address with the invoice number and the error.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top; everything else stays as written.

1. **Trigger:** Xero, `xero` version `2.22.1`, action `updated_invoice_v2`. Params: `organization` set to the Xero organization, `status` set to `paid`. The trigger needs a Xero connection.
2. **Connections** (each alias in the code is the app's slug):
   - `xero`: the Xero connection for the organization being watched (the trigger uses it).
   - `cartoncloud`: the CartonCloud connection for the warehouse account.
   - `gmail`: the Gmail connection that sends IT notices.
3. **Constants** (top of `workflow.ts`):
   - `XERO_ORGANIZATION`: the Xero organization ID.
   - `MAX_INVOICE_TOTAL`: the largest total that counts as zero or near-zero. Set to `1`.
   - `SKIP_BRANCH_INDICATORS`: reference words that mark a branch invoice to skip. Empty by default, which skips nothing.
   - `CARTONCLOUD_TENANT`, `CARTONCLOUD_CUSTOMER`: the CartonCloud tenant and customer the orders belong to.
   - `IT_ALERT_EMAIL`: the address for failure notices.
4. Test with the steps below, then publish, wait until the trigger is active, and confirm the trigger is live in the editor.

## Ask the user

- Which Xero organization holds the invoices, and which CartonCloud tenant and customer should own the orders?
- Is the threshold `1` right for "near-zero", or should it be another amount?
- Are there branch indicators in invoice references to skip? If so, list them.
- Which address should get failure notices?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a Xero invoice that is paid with a total of `0.00` and whose contact has a full address:

```json
{
  "invoice": {
    "InvoiceNumber": "INV-0001",
    "InvoiceID": "<id>",
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

Check that one outbound order appears in CartonCloud with order reference `INV-0001`, the right address and item, and the invoice PDF attached. Then run it again with a `Total` above the threshold, such as `"250.00"`, and check that no order is created. Then run it with a broken CartonCloud connection, if you can, and check that the IT address gets one failure notice. Delete any test order in CartonCloud if it was real data.

## Customize

- **Swap the warehouse system:** replace CartonCloud with any warehouse or order-management app that can create an outbound order.
- **Swap the alert channel:** replace the Gmail failure notice with an SMS or team chat message.

## Notes

- Create order runs once per paid invoice update. Check CartonCloud for an existing order before relying on this in production, since the workflow does not look up orders it already created.
- The trigger reads Xero's invoice history. Xero can take a short time to record an update, so a zero-paid invoice may dispatch a few minutes after it is marked paid.
- Never commit a real Xero organization ID, CartonCloud tenant, or email address.
