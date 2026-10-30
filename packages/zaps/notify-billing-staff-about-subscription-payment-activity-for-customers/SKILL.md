---
name: notify-billing-staff-about-subscription-payment-activity-for-customers
description: Build a Zapier Next Gen Zap that emails billing staff a short alert whenever a Stripe customer subscription changes, so finance can reconcile and respond the same day. Use when a finance or billing team needs to hear about subscription and payment activity as it happens instead of checking Stripe by hand.
metadata:
  author: zapier
  summary: "Whenever a customer's subscription changes in Stripe, billing staff get an email with the customer, the new status and the latest invoice, so they can act the same day."
  apps: "Stripe, Gmail"
  category: "Sales"
  job: "Renewal management"
  source: "https://zapier.com/automations/sales/renewal-management/subscription-renewal-workflows/notify-billing-staff-about-subscription-payment-activity-for-customers"
---

# Notify billing staff about subscription payment activity

## What it does

1. **Trigger:** a customer subscription is updated in Stripe (Stripe, Updated Subscription).
2. **Code** checks that the update has a subscription ID. If not, the run stops and sends nothing.
3. **Code** builds a one-line subject (customer name and subscription status) and a short body: the subscription ID, status, latest invoice, current period end, and a link to the subscription record.
4. **Gmail** sends that email to the billing inbox.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Stripe, Updated Subscription (`stripe`, `updated_customer_subscription`). It needs the user's Stripe connection, so its `authentication_id` is that connection's ID.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the user's Gmail connection, for the account that sends the alert.
3. **Constants:**
   - `BILLING_EMAIL`: the inbox that receives the alert. It must be the address of the connected Gmail account.
   - `SUBSCRIPTION_LINK_BASE`: the start of the link to a subscription record. The default is the Stripe dashboard; change it if your team uses another page.

## Ask the user

- Which inbox should receive the billing alert? It has to be the connected Gmail address.
- Which Stripe account should the trigger watch? Use a test-mode connection for the first test.
- Should the alert skip some updates, such as ones with no status change or no invoice? The trigger payload does not say what changed, so the template sends every update unless you add a filter.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a test-mode Stripe connection, and a subscription that exists in that account:

```json
{
  "id": "sub_test_123",
  "status": "past_due",
  "latest_invoice": "in_test_456",
  "current_period_end": "2026-11-29T00:00:00Z",
  "customer": {
    "id": "cus_test_789",
    "name": "Test Customer",
    "email": "customer@example.com"
  }
}
```

Confirm that one email reached the billing inbox with the subject `Test Customer: subscription past_due`, the body lists the subscription and invoice, and the link opens the matching Stripe record. Then tell the user to cancel the test subscription if it was not real data.

## Customize

- **Format amounts:** add a Formatter by Zapier step (or plain code) to show the invoice amount in your currency format. The trigger payload does not include an amount field, so the amount has to come from a Stripe invoice lookup first.
- **Urgent failures:** add a Slack message in parallel for failed payments, so the on-call person sees them right away.

## Notes

- The email goes to one address. For more than one recipient, change `BILLING_EMAIL` to a Gmail group address.
- Each subscription update sends one email. A busy account will send many, so add a filter if the inbox fills up.
- The subject and body show the Stripe subscription ID and invoice ID, not the amount.
- Never commit a real billing email address or a Stripe connection ID to the workflow source.
