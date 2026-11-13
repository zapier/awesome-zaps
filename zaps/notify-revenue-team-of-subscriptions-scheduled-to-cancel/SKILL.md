---
name: notify-revenue-team-of-subscriptions-scheduled-to-cancel
description: Build a Zap on Zapier that emails the revenue team and account owner when a Stripe subscription is set to cancel at the end of its billing period, so retention outreach can start before it ends. Use when a business bills subscriptions in Stripe and wants early warning of cancellations scheduled for period end.
license: MIT
metadata:
  author: zapier
  summary: "When a customer schedules a subscription to cancel, your revenue team gets an email right away with the customer and the date it ends, so they can reach out in time."
  apps: "Stripe, Gmail"
  category: "Sales"
  job: "Renewal management"
  source: "https://zapier.com/automations/sales/renewal-management/subscription-renewal-workflows/notify-revenue-team-of-subscriptions-scheduled-to-cancel"
---

# Notify revenue team of subscriptions scheduled to cancel

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/notify-revenue-team-of-subscriptions-scheduled-to-cancel. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Stripe subscription changes (`stripe`, `updated_customer_subscription`). The run continues only if the subscription has `cancel_at_period_end` set to true; any other update stops the run and sends nothing.
2. **Gmail** sends one email to the revenue distribution list and the account owner. The subject names the customer, and the body lists the subscription ID, customer ID, customer email and the date the current period ends.

The Zap only sends the alert. It doesn't change the subscription or the customer.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting               | What goes there                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------- |
| `REVENUE_TEAM_EMAIL`  | The revenue team's distribution address. Put one address here.                                                  |
| `ACCOUNT_OWNER_EMAIL` | The account owner's address. Put one address here, or repeat the revenue address if there is no separate owner. |

Also review the defaults with them:

- The trigger watches the live Stripe account. Test-mode events are off by default; ask whether the user wants them.
- The email is sent from the connected Gmail account. Ask whether it should come from another sender.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `stripe` (the account whose subscriptions are watched; the trigger uses it) and `gmail` (the account that sends the alert) to the user's connections.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-customer-subscription.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test before publishing, with a subscription that is scheduled to cancel:

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

Check that one email arrived at the revenue address and the account owner's address, with the customer name in the subject and the period end in the body. Then send the same sample with `cancel_at_period_end` set to `"false"` and check that the run skips and sends nothing. If run-status tools aren't available, check Gmail directly. Ask the user to delete the test emails; the agent doesn't delete them. Then publish, confirm the trigger is active.

## Notes

- Stripe sends a subscription update every time the subscription changes, so a subscription that stays scheduled to cancel can trigger more than one alert.
- If the customer has no email in Stripe, the body says so and the alert still goes out.
- To attach deal stage and owner to the alert, add a CRM lookup before the email. To track outreach, create a follow-up task in the project tool instead of, or as well as, the email.
- Keep real addresses and account IDs out of `workflow.ts`; anyone who can read the file sees where alerts go. Change nothing else in the code.
