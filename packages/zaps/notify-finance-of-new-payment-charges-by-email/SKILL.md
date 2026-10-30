---
name: notify-finance-of-new-payment-charges-by-email
description: Build a Zapier Next Gen Zap that emails your finance and billing recipients for every new Stripe charge, so accounting can reconcile and triage issues the same day. Use when a business takes card payments through Stripe and wants finance notified of each charge, including failed ones, without checking the dashboard.
metadata:
  author: zapier
  summary: "Every new Stripe charge sends your finance team a short email with the amount, status and a link to the charge, so issues get triaged the same day."
  apps: "Stripe (Legacy), Email by Zapier"
  category: "Finance"
  job: "Payment operations"
  source: "https://zapier.com/automations/finance/payment-operations/payment-reconciliation/notify-finance-of-new-payment-charges-by-email"
---

# Notify finance of new payment charges by email

## What it does

1. **Trigger:** a Stripe (Legacy) new charge event, with failed charges included. Each charge starts one run.
2. **Email by Zapier** sends one plain-text email to the finance recipients. The subject carries the charge ID and status. The body has the amount, currency, status and a link to the charge in the Stripe dashboard.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Stripe (Legacy), New Charge (`stripe-legacy`, action `charge_v3`). Params: `include_failed_charges: "true"`. It needs the user's Stripe connection, so its `authentication_id` is the connection ID.
2. **Connections:** none in the code. Email by Zapier is a no-auth app and gets no alias. The Stripe connection is used only by the trigger.
3. **Constants:**
   - `FINANCE_RECIPIENTS`: the finance and billing addresses, comma separated, up to five. Replace `YOUR_FINANCE_EMAIL`.
   - `SEND_EMAIL`: `true` sends the email. Set to `false` to log without emailing.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user the trigger's webhook URL if one is shown.

## Ask the user

- Which addresses should receive the charge emails? Replace `YOUR_FINANCE_EMAIL` with them.
- Which Stripe account should the trigger use? Connect it in Zapier first; the trigger cannot run without it.
- Should failed charges trigger an email, or only succeeded ones? This template includes them, as the source automation does.

## Test

Before publishing, run this sample as a draft test run (`run_workflow_draft`), with the email constant set to the user's own address so no one else receives it:

```json
{
  "id": "ch_test_0001",
  "amount": 2500,
  "currency": "usd",
  "status": "succeeded"
}
```

Check that one email arrived with the subject `New Stripe charge ch_test_0001 (succeeded)` and that the body shows the amount, currency, status and the dashboard link. Then run one real failed charge on a Stripe test-mode account and confirm the email shows the status `failed`.

## Customize

- **Escalate high-value charges:** route only charges above a threshold to a secondary escalation list, with a Filter step before the email.
- **Separate failed charges:** add a Filter by Zapier step so failed charges go to operations routing and succeeded ones go to finance.

## Notes

- Email by Zapier sends from a zapiermail.com address and is limited to 10 sends per hour on paid plans. A busy account will hit that limit; use Gmail or SMTP for higher volume.
- Stripe amounts are in the smallest currency unit (for example, cents). The email shows the raw number, as the source automation does.
- Never commit a real finance address. Anyone with it can read charge details.
