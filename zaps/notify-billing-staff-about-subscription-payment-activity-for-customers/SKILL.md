---
name: notify-billing-staff-about-subscription-payment-activity-for-customers
description: Build a Zap on Zapier that emails billing staff a short alert whenever a Stripe customer subscription changes, so finance can reconcile and respond the same day. Use when a finance or billing team needs to hear about subscription and payment activity as it happens instead of checking Stripe by hand.
license: MIT
metadata:
  author: zapier
  summary: "Whenever a customer's subscription changes in Stripe, billing staff get an email with the customer, the new status and the latest invoice, so they can act the same day."
  apps: "Stripe, Gmail"
  category: "Sales"
  job: "Renewal management"
  source: "https://zapier.com/automations/sales/renewal-management/subscription-renewal-workflows/notify-billing-staff-about-subscription-payment-activity-for-customers"
---

# Notify billing staff about subscription payment activity

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/notify-billing-staff-about-subscription-payment-activity-for-customers. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a customer subscription is updated in `stripe` (`updated_customer_subscription`).
2. **Code** checks that the update has a subscription ID. If not, the run stops and sends nothing.
3. **Code** builds a one-line subject (customer name and subscription status) and a short body: the subscription ID, status, latest invoice, current period end, and a link to the subscription record.
4. **Gmail** sends that email to the billing inbox.

The Zap only sends email. It never changes the subscription or the invoice.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                 | What goes there                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `REPLACE_BILLING_EMAIL` | The billing inbox that receives the alert. It must be the address of the connected Gmail account. |

Also review the defaults with them: `SUBSCRIPTION_LINK_BASE` is the Stripe dashboard link to a subscription record. Change it if the team uses another page.

Questions to settle before building:

- Which inbox should receive the billing alert? It has to be the connected Gmail address.
- Which Stripe account should the trigger watch? Use a test-mode connection for the first test.
- Should the alert skip some updates, such as ones with no status change or no invoice? The trigger payload does not say what changed, so the Zap sends every update unless a filter is added.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` to the user's Gmail connection for the account that sends the alert. The trigger watches `stripe`, so bind that to the user's Stripe connection too. Use a test-mode Stripe connection for the first test.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-customer-subscription.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a test-mode Stripe connection and a subscription that exists in that account:

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

Check that one email reached the billing inbox with the subject `Test Customer: subscription past_due`, that the body lists the subscription and invoice, and that the link opens the matching Stripe record. If run-status tools aren't available, check the billing inbox in Gmail directly. Then publish, confirm the trigger is active, and do the real thing once. The user deletes the test email and cancels the test subscription if it was not real data; the agent doesn't delete either.

## Notes

- The email goes to one address. For more than one recipient, set `BILLING_EMAIL` to a Gmail group address.
- Each subscription update sends one email, so a busy account sends many. Add a filter if the inbox fills up.
- The subject and body show the subscription ID and invoice ID, not the amount. To show the amount, look up the invoice in Stripe first, then format it with Formatter by Zapier or plain code.
- For urgent failed payments, add a Slack message in parallel so the on-call person sees them right away.
- Never commit a real billing email address or a Stripe connection ID to the workflow source.
