---
name: create-sku-level-product-records-from-each-online-order
description: Build a Zap on Zapier that turns each new paid Shopify order into one row per line item in a product performance table, with product name, SKU, quantity, unit price, total revenue, order date and order reference. Use when an online store wants SKU-level sales visibility for merchandising or inventory teams without copying orders by hand.
license: MIT
metadata:
  author: zapier
  summary: "Every paid Shopify order is split into one product record per line item, so merchandising and inventory teams can see what sold, by SKU, as orders come in."
  apps: "Shopify, Zapier Tables"
  category: "Product"
  job: "Product analytics"
  source: "https://zapier.com/automations/product/product-analytics/product-performance-metrics/create-sku-level-product-records-from-each-online-order"
---

# Create SKU-level product records from each online order

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-sku-level-product-records-from-each-online-order. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new paid order in Shopify (`shopify`, `new_paid_order_v3`). The full order payload, including its line items, starts the run.
2. **Zapier Tables** creates one record per line item in the product performance table: product name, SKU, quantity, unit price, total revenue (unit price × quantity), order date (the order's timestamp, ISO format), order reference (the order name, such as `#1001`) and customer reference (the Shopify customer ID).
3. Each line item is written on its own. If one fails, the others still get written, and the run reports how many failed. An order with no line items writes nothing and says so in the run output.

The Zap only adds records. It never edits or deletes existing ones, and it does not subtract refunds or cancellations.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting            | What goes there                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_TABLE_ID` | The product performance table: ask the user which Zapier table it is, then look up its ID with their Zapier Tables connection |

Also review these with the user:

- The table needs eight columns, in this order: Product Name (text), SKU (text), Quantity (number), Unit Price (number), Total Revenue (number), Order Date (date & time), Order Reference (text), Customer Reference (text). If their names differ, the field keys in `workflow.ts` must change to match.
- The order reference is the Shopify order name (`#1001`), not its internal ID.
- The Zap always creates a record. If the same order comes through twice, it creates a second set of rows; it does not look for existing ones first.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zapier-tables` to the user's Zapier Tables connection, for the account that owns the product performance table. The Shopify trigger's `shopify` account is set in step 2. No other app needs an account.
2. **Source:** publish `workflow.ts` and `config.ts`, with `REPLACE_TABLE_ID` replaced by the user's answer. `triggers/new-paid-order.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test before publishing, using this payload rather than a real order:

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

Check that the table gained two rows, one per line item. The first should show quantity 2, unit price 25.00 and total revenue 50.00, and the second quantity 1, unit price 18.50 and total revenue 18.50. Both should show the order date, order reference `#1001` and customer reference `207119551`. If run-status tools aren't available, check the result in Zapier Tables directly. Ask the user to delete the two test rows; the agent doesn't delete them. Publish only after the test passes, and confirm the trigger is active.

## Notes

- To add weekly SKU totals or low-stock alerts, add a step after the records are written.
- Dates are stored as the order's own timestamp. The table may show them in its own format and time zone.
- Shopify's order and line-item fields are read by name. If a Shopify app version changes them, update the keys in `workflow.ts`.
- Anyone who can edit the table can change the records it creates, so never commit a real table ID.
