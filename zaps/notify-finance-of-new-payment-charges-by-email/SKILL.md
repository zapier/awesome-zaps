---
name: notify-finance-of-new-payment-charges-by-email
description: Build a Zap on Zapier that emails your finance and billing recipients for every new completed Stripe charge, so accounting can reconcile and triage issues the same day. Use when a business takes card payments through Stripe and wants finance notified of each charge without checking the dashboard.
license: MIT
metadata:
  author: zapier
  summary: "Every new Stripe charge sends your finance team a short email with the amount, status and a link to the charge, so issues get triaged the same day."
  apps: "Stripe, Email by Zapier"
  category: "Finance"
  job: "Payment operations"
  source: "https://zapier.com/automations/finance/payment-operations/payment-reconciliation/notify-finance-of-new-payment-charges-by-email"
---

# Notify finance of new payment charges by email

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/notify-finance-of-new-payment-charges-by-email. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new completed charge in Stripe (`stripe`, `new_charge`). Each charge starts one run. Failed payments are a separate Stripe trigger and don't start this one (see Notes).
2. **Email by Zapier** sends one plain-text email to the finance recipients. The subject carries the charge ID and status. The body has the amount, currency, status and a link to the charge in the Stripe dashboard.

The Zap only sends email. It never changes or refunds a charge.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting              | What goes there                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `FINANCE_RECIPIENTS` | The finance and billing email addresses that get each charge email, comma separated, up to five |

Also review the default with them: `SEND_EMAIL` in `workflow.ts` (`true` sends the email; `false` only logs the charge).

Before turning it on, confirm the user has a Stripe connection for the account whose charges they want. The trigger cannot run without it.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `stripe` to the user's Stripe connection. The trigger uses it. Email by Zapier needs no connection and gets no alias.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/charge.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with `FINANCE_RECIPIENTS` set to an address the user controls so no one else gets the test email:

```json
{
  "id": "ch_test_0001",
  "amount": 2500,
  "currency": "usd",
  "status": "succeeded"
}
```

Check that one email arrived with the subject `New Stripe charge ch_test_0001 (succeeded)` and that the body shows the amount, currency, status and the dashboard link. If run-status tools aren't available, check the inbox directly. Then publish, confirm the trigger is active, and ask the user to delete the test emails. The user deletes test data, not the agent.

## Notes

- Email by Zapier sends from a zapiermail.com address and is limited to 10 sends an hour on paid plans. A busy account will hit that limit; use Gmail or SMTP for higher volume.
- Stripe amounts are in the smallest currency unit (cents), and the email shows the raw number.
- To escalate high-value charges, add a Filter before the email that routes charges above a threshold to a second list. To also email failed payments, build a second Zap from this folder under its own name with Stripe's `failed_payment` trigger, and inspect its sample first: it carries the payment attempt, so its fields may not match `InputSchema`.
- Never commit a real finance address. Anyone with it can read charge details.
