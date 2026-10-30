---
name: create-sales-orders-and-line-items-from-purchases
description: Build a Zapier Next Gen Zap that, when a Shopify order is paid, posts a sales order to your ERP or CRM and one line per purchased item, plus a negative discount line when the order has a discount. Use when a store sells online and order records must be created in an ERP or CRM so project coordinators and fulfillment staff work from consistent data.
metadata:
  author: zapier
  summary: "When a Shopify order is paid, its sales order and each item are created in your ERP or CRM, with a discount line when there is one, so fulfillment works from the same data."
  apps: "Shopify, Webhooks by Zapier"
  category: "Sales"
  job: "Sales operations"
  source: "https://zapier.com/automations/sales/sales-operations/sales-order-processing/create-sales-orders-and-line-items-from-purchases"
---

# Create sales orders and line items from purchases

## What it does

1. **Trigger:** a new paid order in Shopify (`new_paid_order_v3`). The order ID is sent as the order's external ID, so the receiving system can match repeats.
2. **Code step:** the order's sales channel (`sourceName`) becomes a readable customer label, such as `Online Store`.
3. **Webhooks by Zapier** POSTs the order to your ERP or CRM Orders endpoint: order date, order number, customer label, customer email and phone, and the billing and shipping addresses.
4. **Webhooks by Zapier** POSTs one sales-order line per purchased item: item ID, SKU, description, quantity, unit price and total price. Each line is its own step, so one failed line does not stop the others.
5. If the order has a discount above zero, **Webhooks by Zapier** POSTs one extra line with the discount as a negative amount.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Shopify, New Paid Order (`shopify`, `new_paid_order_v3`). Connect the store's Shopify account on the trigger step.
2. **Connections** (each alias in the code is the app's slug):
   - `shopify`: the Shopify account for the store (used by the trigger).
   - `webhook`: Webhooks by Zapier needs no connection. Leave it unset.
3. **Constants:**
   - `ORDERS_WEBHOOK_URL`: the URL of your ERP or CRM endpoint that creates sales orders.
   - `ORDER_LINES_WEBHOOK_URL`: the URL of the endpoint that creates sales-order lines, including the discount line.
   - `CUSTOMER_LABELS`: maps Shopify sales channels (`sourceName`) to the customer label to send. Channels not listed are labelled `Shopify (<sourceName>)`.

## Ask the user

- What is the ERP or CRM endpoint for sales orders, and the one for sales-order lines? Both are sent as JSON. If the system wants different field names, change the `data` objects in `workflow.ts` before the first test run.
- Which Shopify sales channels should map to which customer label?
- Does the ERP match customers by email and create a new customer when none matches? This workflow sends the email and leaves matching to that system.

## Test

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

Check that the order endpoint received one sales order with `external_id` `820982911946154508`, that the lines endpoint received two item lines (`TEST-SHIRT-M` at 2 × 20.00 and `TEST-CAP` at 1 × 15.00), and that one discount line of -5.00 followed. Then delete the test records in the ERP or CRM.

## Customize

- **Route by storefront:** send orders from specific storefronts to a different sales rep or warehouse, by adding a lookup on `sourceName` before the order POST.
- **Skip digital SKUs:** leave out line items for digital or non-fulfillment SKUs, to reduce downstream tasks.

## Notes

- Amounts are sent as text with two decimals. Quantities are numbers.
- Line items are read from the order's `lineItems`. If your Shopify app version names those fields differently, update `LineItemSchema` and the line mapping together.
- Anyone with an endpoint URL can create records in that system. Keep the URLs out of shared copies of this file.
- Shopify's trigger returns an order's items only when the order has line-item support; the New Paid Order trigger used here has it.
