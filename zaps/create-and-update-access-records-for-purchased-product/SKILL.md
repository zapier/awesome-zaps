---
name: create-and-update-access-records-for-purchased-product
description: Build a Zap on Zapier that creates or updates a user's access record in your user management API when a paid Shopify order includes the configured product. Use when a store sells a product that should grant a user account or access, and onboarding should start as soon as the order is paid.
license: MIT
metadata:
  author: zapier
  summary: "When a customer pays for the product, their access record is created or updated in your user system so onboarding can start right away."
  apps: "Shopify, Webhooks by Zapier"
  category: "IT"
  job: "Identity access management"
  source: "https://zapier.com/automations/it/identity-access-management/user-provisioning/create-and-update-access-records-for-purchased-product"
---

# Create and update access records for purchased product

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-and-update-access-records-for-purchased-product. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a paid order arrives from Shopify (`shopify`, `new_paid_order_v3`).
2. **Filter:** the workflow continues only if one of the order's line items has the configured product ID. Otherwise it stops with `skipped`.
3. **Email check:** the workflow needs an email address (customer email, then order email). Without one it stops with `skipped`.
4. **Webhooks by Zapier POST:** sends the email, name, `access_status` (`active`), and billing and shipping address summaries as JSON to your user management API. The API creates the user when no match exists, or updates the existing user with the same email.

The workflow never matches or updates users itself; the user management API must match on email.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                 | What goes there                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `QUALIFYING_PRODUCT_ID` | The Shopify product whose paid orders grant access; look up its ID with the user's Shopify connection |
| `USER_API_URL`          | The endpoint of the user management API that accepts a JSON POST                                      |

Also review the default `ACCESS_STATUS` (`"active"`) with them: it is the status sent with each record.

Before building, confirm:

- Does the user management API create or update the user when the email already exists? If it only creates, add a lookup step before the POST.
- Does the API need an authorization header? Add the token through a connection, never as a constant.
- Does the API expect the address summaries in a different shape?

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `shopify` to the store's Shopify connection, which the trigger uses. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-paid-order.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match. In particular, confirm the trigger's `customer`, `line_items`, `billing_address` and `shipping_address` fields.

## Test it

Run this sample as a draft test before publishing. It does not contain the qualifying product, so it exercises the filter and makes no external call:

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

Expect `{ "skipped": true, "reason": "no-qualifying-product" }` and no webhook call. Then run a paid order for the qualifying product on a test store. The user management API should receive one POST with `email`, `name`, `access_status: "active"`, and the address summaries. If run-status tools aren't available, check the result in your user management API directly. The user deletes any test records, not the agent. Publish only after both checks pass, and confirm the trigger is active.

## Notes

- Confirm the trigger's output fields against a real order before relying on the workflow.
- Never commit a real product ID, API URL, token, or customer data.
- To extend it, alert onboarding with an Email by Zapier or Slack step after the POST, or record the Shopify order ID on the user record for audit and reconciliation.
