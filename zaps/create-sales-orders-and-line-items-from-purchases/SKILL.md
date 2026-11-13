---
name: create-sales-orders-and-line-items-from-purchases
description: Build a Zap on Zapier that, when a Shopify order is paid, posts a sales order to your ERP or CRM and one line per purchased item, plus a negative discount line when the order has a discount. Use when a store sells online and order records must be created in an ERP or CRM so project coordinators and fulfillment staff work from consistent data.
license: MIT
metadata:
  author: zapier
  summary: "When a Shopify order is paid, its sales order and each item are created in your ERP or CRM, with a discount line when there is one, so fulfillment works from the same data."
  apps: "Shopify, Webhooks by Zapier"
  category: "Sales"
  job: "Sales operations"
  source: "https://zapier.com/automations/sales/sales-operations/sales-order-processing/create-sales-orders-and-line-items-from-purchases"
---

# Create sales orders and line items from purchases

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-sales-orders-and-line-items-from-purchases. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new paid order in Shopify (`shopify`, `new_paid_order_v3`). The order ID is sent as the order's external ID, so the receiving system can match repeats.
2. **Code step:** the order's sales channel (`sourceName`) becomes a readable customer label, such as `Online Store`.
3. **Webhooks by Zapier** POSTs the order to your ERP or CRM Orders endpoint: order date, order number, customer label, customer email and phone, and the billing and shipping addresses.
4. **Webhooks by Zapier** POSTs one sales-order line per purchased item: item ID, SKU, description, quantity, unit price and total price. Each line is its own step, so one failed line does not stop the others.
5. If the order has a discount above zero, **Webhooks by Zapier** POSTs one extra line with the discount as a negative amount.

The Zap only creates records; it never changes or cancels an existing order.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | What goes there                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `ORDERS_WEBHOOK_URL`      | The URL of the ERP or CRM endpoint that receives each new sales order. Anyone with this URL can create orders. |
| `ORDER_LINES_WEBHOOK_URL` | The URL of the ERP or CRM endpoint that receives each sales-order line, including the discount line.           |

Also review the default with them: `CUSTOMER_LABELS` in `workflow.ts` maps Shopify sales channels (`sourceName`) to the customer label to send. Channels not listed are labelled `Shopify (<sourceName>)`.

Also ask:

- Does the ERP match customers by email and create a new customer when none matches? This workflow sends the email and leaves matching to that system.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `shopify` to the user's Shopify connection for the store. The trigger uses it. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-paid-order.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing, against test endpoints only, with a test order from a Shopify development store:

```json
{
  "id": 820982911946154508,
  "name": "#1001",
  "email": "buyer@example.com",
  "phone": null,
  "createdAt": "2026-10-29T10:15:00Z",
  "sourceName": "web",
  "currencyCode": "USD",
  "billingAddress": {
    "name": "Test Buyer",
    "address1": "1 Test Street",
    "city": "New York",
    "province": "NY",
    "zip": "10001",
    "country": "United States"
  },
  "shippingAddress": {
    "name": "Test Buyer",
    "address1": "1 Test Street",
    "city": "New York",
    "province": "NY",
    "zip": "10001",
    "country": "United States"
  },
  "lineItems": [
    {
      "id": 1,
      "title": "Test shirt",
      "sku": "TEST-SHIRT-M",
      "quantity": 2,
      "price": "20.00"
    },
    {
      "id": 2,
      "title": "Test cap",
      "sku": "TEST-CAP",
      "quantity": 1,
      "price": "15.00"
    }
  ],
  "totalDiscountsSet": {
    "shopMoney": { "amount": "5.00", "currencyCode": "USD" }
  }
}
```

Check that the order endpoint received one sales order with `external_id` `820982911946154508`, that the lines endpoint received two item lines (`TEST-SHIRT-M` at 2 × 20.00 and `TEST-CAP` at 1 × 15.00), and that one discount line of -5.00 followed. If run-status tools aren't available, check the result in the ERP or CRM directly. Ask the user to delete the test records there; the agent does not delete them.

## Notes

- Amounts are sent as text with two decimals. Quantities are numbers.
- Line items are read from the order's `lineItems`. If your Shopify app version names those fields differently, update `LineItemSchema` and the line mapping together.
- Anyone with an endpoint URL can create records in that system. Keep the URLs out of shared copies of this file.
- Shopify's trigger returns an order's items only when the order has line-item support; the New Paid Order trigger used here has it.
- To route by storefront, add a lookup on `sourceName` before the order POST. To skip digital SKUs, leave their line items out, to reduce downstream tasks.
