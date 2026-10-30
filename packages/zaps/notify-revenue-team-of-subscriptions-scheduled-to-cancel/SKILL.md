---
name: notify-revenue-team-of-subscriptions-scheduled-to-cancel
description: Build a Zapier Next Gen Zap that emails the revenue team and account owner when a Stripe subscription is set to cancel at the end of its billing period, so retention outreach can start before it ends. Use when a business bills subscriptions in Stripe and wants early warning of cancellations scheduled for period end.
metadata:
  author: zapier
  summary: "When a customer schedules a subscription to cancel, your revenue team gets an email right away with the customer and the date it ends, so they can reach out in time."
  apps: "Stripe, Gmail"
  category: "Sales"
  job: "Renewal management"
  source: "https://zapier.com/automations/sales/renewal-management/subscription-renewal-workflows/notify-revenue-team-of-subscriptions-scheduled-to-cancel"
---

# Notify revenue team of subscriptions scheduled to cancel

## What it does

1. **Trigger:** a Stripe subscription changes (Stripe's Updated Subscription trigger).
2. **Filter:** the run continues only if the subscription has `cancel_at_period_end` set to true. Any other update stops the run and sends nothing.
3. **Gmail** sends one email to the revenue distribution list and the account owner. The subject names the customer, and the body lists the subscription ID, customer ID, customer email and the date the current period ends.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Stripe, Updated Subscription (`updated_customer_subscription`). It needs the user's Stripe connection, so its `authentication_id` is that connection's ID.
2. **Connections** (each alias in the code is the app's slug):
   - `stripe`: the user's Stripe connection, for the account whose subscriptions should be watched.
   - `gmail`: the user's Gmail connection, for the account that sends the alert.
3. **Constants:**
   - `REVENUE_TEAM_EMAIL`: the revenue team's distribution address. Put one address here.
   - `ACCOUNT_OWNER_EMAIL`: the account owner's address. Put one address here, or repeat the revenue address if there is no separate owner.

Change nothing else in the code.

## Ask the user

- Which Stripe account should the trigger watch? Use the live account unless the user wants test-mode events, which are off by default.
- What is the revenue team's distribution address?
- Who is the account owner, and what is their address? The alert goes there too.
- Should the email come from the Gmail account that's connected, or from another sender?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with a subscription that is scheduled to cancel:

```json
{
  "id": "sub_EXAMPLE123",
  "cancel_at_period_end": "true",
  "current_period_end": "2026-11-30T00:00:00Z",
  "customer__id": "cus_EXAMPLE456",
  "customer__name": "Example Customer",
  "customer__email": "customer@example.com",
  "status": "active"
}
```

Confirm that one email arrived at the revenue address and the account owner's address, with the customer name in the subject and the period end in the body. Then send the same sample with `cancel_at_period_end` set to `"false"` and confirm the run skips and sends nothing.

## Customize

- **Add a CRM lookup** before the email, to attach deal stage and owner to the alert.
- **Create a follow-up task** in your project tool for outreach, instead of, or as well as, the email.

## Notes

- Stripe sends a subscription update every time the subscription changes, so a subscription that stays scheduled to cancel can trigger more than one alert.
- The alert uses the subscription's email on file. If the customer has no email in Stripe, the body says so and the alert still goes out.
- Never commit a real email address or account ID into `workflow.ts`. Anyone who can read the file can see where alerts go.
