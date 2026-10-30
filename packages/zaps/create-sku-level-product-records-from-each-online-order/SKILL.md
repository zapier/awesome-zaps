---
name: create-sku-level-product-records-from-each-online-order
description: Build a Zapier Next Gen Zap that turns each new paid Shopify order into one row per line item in a product performance table, with product name, SKU, quantity, unit price, total revenue, order date and order reference. Use when an online store wants SKU-level sales visibility for merchandising or inventory teams without copying orders by hand.
metadata:
  author: zapier
  summary: "Every paid Shopify order is split into one product record per line item, so merchandising and inventory teams can see what sold, by SKU, as orders come in."
  apps: "Shopify, Zapier Tables"
  category: "Product"
  job: "Product analytics"
  source: "https://zapier.com/automations/product/product-analytics/product-performance-metrics/create-sku-level-product-records-from-each-online-order"
---

# Create SKU-level product records from each online order

## What it does

1. **Trigger:** a new paid order in Shopify (New Paid Order). The full order payload, including its line items, starts the run.
2. **Zapier Tables** creates one record per line item in your product performance table: product name, SKU, quantity, unit price, total revenue (unit price × quantity), order date (the order's timestamp, ISO format), order reference (the order name, such as `#1001`) and customer reference (the Shopify customer ID).
3. Each line item is written on its own. If one fails, the others still get written, and the run reports how many failed.

An order with no line items writes nothing and says so in the run output.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constant listed below; everything else stays as written.

1. **Trigger:** Shopify, New Paid Order (`shopify`, `new_paid_order_v3`). It needs the user's Shopify connection, so its `authentication_id` is that connection.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the user's Zapier Tables connection, for the account that owns the product performance table.
3. **Constants:**
   - `TABLE_ID`: the ID of the product performance table, from the table's URL. Replace `YOUR_TABLE_ID` with it.
4. The table needs eight columns, in this order: Product Name (text), SKU (text), Quantity (number), Unit Price (number), Total Revenue (number), Order Date (date & time), Order Reference (text), Customer Reference (text).
5. Test with the steps below, then publish, wait until the trigger is active, and point the user at the workflow in the editor.

## Ask the user

- Which Zapier table is the product performance table, and do its columns match the eight above? If the names differ, the field keys in `workflow.ts` must change to match.
- Should the order reference be the Shopify order name (`#1001`) or its internal ID? The workflow uses the name.
- Should orders that were already written be skipped if the same order comes through twice? The workflow always creates a record; it does not look for an existing one first.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a test order that exists in the user's Shopify store, or a copy of this payload:

```json
{
  "id": 820982911946154508,
  "name": "#1001",
  "createdAt": "2026-10-29T10:15:00Z",
  "customer": { "id": 207119551 },
  "lineItems": [
    {
      "id": 1,
      "name": "Classic Tee - Black / M",
      "sku": "TEE-BLK-M",
      "quantity": 2,
      "price": "25.00"
    },
    {
      "id": 2,
      "name": "Canvas Tote",
      "sku": "TOTE-NAT",
      "quantity": 1,
      "price": "18.50"
    }
  ]
}
```

Check that the table gained two rows, one per line item. The first should show quantity 2, unit price 25.00 and total revenue 50.00, and the second quantity 1, unit price 18.50 and total revenue 18.50. Both should show the order date, order reference `#1001` and customer reference `207119551`. Then tell the user to delete the two test rows if they were real data.

## Customize

- **Weekly SKU totals:** add a step after the records are written that adds up the week's sales by SKU for a merchandising dashboard.
- **Low-stock alerts:** add a check that compares weekly SKU sales with a configured limit, and sends an alert or creates an inventory task when the limit is passed.

## Notes

- Orders are read at the time they are paid. Refunds and cancellations are not subtracted from the table.
- Dates are stored as the order's own timestamp. The table may show them in its own format and time zone.
- Shopify's order and line-item fields are read by name, so a store whose Shopify app version changes them may need the keys updated.
- Never commit a real table ID. Anyone who can edit the table can change the records it creates.
