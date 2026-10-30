---
name: create-and-update-access-records-for-purchased-product
description: Build a Zapier Next Gen Zap that creates or updates a user's access record in your user management API when a paid Shopify order includes the configured product. Use when a store sells a product that should grant a user account or access, and onboarding should start as soon as the order is paid.
metadata:
  author: zapier
  summary: "When a customer pays for the product, their access record is created or updated in your user system so onboarding can start right away."
  apps: "Shopify, Webhooks by Zapier"
  category: "IT"
  job: "Identity access management"
  source: "https://zapier.com/automations/it/identity-access-management/user-provisioning/create-and-update-access-records-for-purchased-product"
---

# Create and update access records for purchased product

## What it does

1. **Trigger:** a paid order arrives from Shopify (New Paid Order).
2. **Filter:** the workflow continues only if one of the order's line items has the configured product ID. Otherwise it stops with `skipped`.
3. **Email check:** the workflow needs an email address (customer email, then order email). Without one it stops with `skipped`.
4. **Webhooks by Zapier POST:** sends the email, name, `access_status` (`active`), and billing and shipping address summaries as JSON to your user management API. The API creates the user when no match exists, or updates the existing user with the same email.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Shopify, New Paid Order (`shopify` / `new_paid_order_v3`). Needs a Shopify connection for the store.
2. **Connections:**
   - `shopify`: the store's Shopify connection, used by the trigger.
   - Webhooks by Zapier needs no connection (`webhook`, action `post`).
3. **Constants** (at the top of `workflow.ts`):
   - `QUALIFYING_PRODUCT_ID`: the Shopify product ID that grants access.
   - `USER_API_URL`: the endpoint of your user management API that accepts a JSON POST.
   - `ACCESS_STATUS`: the status sent with each record. Defaults to `"active"`.

## Ask the user

- Which Shopify product should grant access, and what is its product ID?
- What is the user management API's endpoint, and does it create or update the user when the email already exists? If it only creates, add a lookup step before the POST.
- Does the API need an authorization header? Keep the token out of the source. Add it through a connection, not as a constant.
- Should a status other than `active` be sent?
- Does the API expect the address summaries in a different shape?

## Test

Run this sample as a test run before publishing. It does not contain the qualifying product, so it exercises the filter and makes no external call:

```json
{
  "id": 1001,
  "email": "test-buyer@example.com",
  "customer": {
    "first_name": "Test",
    "last_name": "Buyer",
    "email": "test-buyer@example.com"
  },
  "line_items": [{ "product_id": "0000000000" }],
  "billing_address": {
    "address1": "1 Test St",
    "city": "New York",
    "province": "NY",
    "country": "US"
  },
  "shipping_address": {
    "address1": "1 Test St",
    "city": "New York",
    "province": "NY",
    "country": "US"
  }
}
```

Expect `{ "skipped": true, "reason": "no-qualifying-product" }` and no webhook call. Then run a paid order for the qualifying product on a test store. The user management API should receive one POST with `email`, `name`, `access_status: "active"`, and the address summaries. Check the trigger's field names against that real order, since the sample above assumes them.

## Customize

- **Notify onboarding:** add an Email by Zapier or Slack step after the POST to alert onboarding specialists on each provisioning.
- **Record the order:** append the Shopify order reference to the user record or notes for audit and reconciliation.

## Notes

- The Shopify trigger's output fields are assumed to be `customer`, `line_items[].product_id`, `billing_address` and `shipping_address`. Confirm them against a real order before relying on the workflow.
- The workflow does not match or update users itself. That is left to the user management API, which must match on email.
- Never commit a real product ID, API URL, or customer data.
