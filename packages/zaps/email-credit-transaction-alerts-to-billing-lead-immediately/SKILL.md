---
name: email-credit-transaction-alerts-to-billing-lead-immediately
description: Build a Zapier Next Gen Zap that watches Xero for new posted credit (money received) bank transactions and immediately emails the billing lead a detailed alert with payee, amount, bank account, date, reference and description. Use when a finance or billing team wants to know the moment money lands so they can reconcile and invoice without delay.
metadata:
  author: zapier
  summary: "When money is received into a Xero bank account, your billing lead gets an email right away with the payee, amount, account, date and reference."
  apps: "Xero, Email by Zapier"
  category: "Finance"
  job: "Banking operations"
  source: "https://zapier.com/automations/finance/banking-operations/transaction-monitoring/email-credit-transaction-alerts-to-billing-lead-immediately"
---

# Email credit transaction alerts to billing lead

## What it does

1. **Trigger:** Xero, New Bank Transaction, fires for each new bank transaction in the chosen organization.
2. **Filter (code):** continues only for credits (Xero types starting with `RECEIVE`: `RECEIVE`, `RECEIVE-OVERPAYMENT`, `RECEIVE-PREPAYMENT`, `RECEIVE-TRANSFER`) whose status is posted (`AUTHORISED`) and whose `Total` is greater than `MIN_CREDIT_AMOUNT`. Anything else returns `skipped` with a reason and sends nothing.
3. **Email by Zapier** sends one email to the billing lead. The subject names the amount and bank account (`Credit received: 1250.00 USD into Business Checking`). The body lists payee, amount, bank account and code, date, reference, line-item descriptions, type, reconciled flag and transaction ID.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Xero, New Bank Transaction (`xero`, `bank_transaction`). Its `authentication_id` is the user's Xero connection, and `params.organization` is required: resolve it from the field's choices (`get_trigger_field_choices`, field `organization`) with that connection.
2. **Connections** (each alias in the code is the app's slug):
   - `xero`: the user's Xero connection, used by the trigger only. Not referenced in the code.
   - `email` (Email by Zapier) needs no connection, so the email step has no `connection:`.
3. **Constants:**
   - `BILLING_LEAD_EMAIL`: who gets the alerts. Up to 5 comma-separated addresses.
   - `MIN_CREDIT_AMOUNT`: alert only when the total is greater than this. Defaults to `0`.
   - `POSTED_STATUSES`: Xero statuses treated as posted. Defaults to `["AUTHORISED"]`.
   - `FROM_NAME`: the sender's display name. Defaults to `"Xero credit alerts"`.
4. Sample the trigger with the chosen organization (the `bank_transaction` read action) and check that `Type`, `Status`, `Total`, `Contact.Name`, `BankAccount.Name` and `LineItems` arrive as the code expects. Then test with the steps below, publish, and wait until the trigger is active.

## Ask the user

- Which Xero organization should be watched? If they have no Xero connection, send them to connect one first.
- What is the billing lead's email address (or a shared inbox)?
- Should small credits be ignored? Set `MIN_CREDIT_AMOUNT` above `0` if so.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, with `BILLING_LEAD_EMAIL` set to an inbox you can read. It sends one real email:

```json
{
  "id": "txn-0001",
  "BankTransactionID": "txn-0001",
  "Type": "RECEIVE",
  "Status": "AUTHORISED",
  "Total": 1250,
  "SubTotal": 1250,
  "TotalTax": 0,
  "CurrencyCode": "USD",
  "Reference": "[install-test] INV-1042",
  "DateString": "2026-10-29T00:00:00",
  "IsReconciled": false,
  "Contact": { "Name": "[install-test] Acme Supplies" },
  "BankAccount": { "Name": "Business Checking", "Code": "090" },
  "LineItems": [
    { "Description": "[install-test] Payment for INV-1042", "LineAmount": 1250 }
  ]
}
```

Check that one email arrives with the subject `Credit received: 1250.00 USD into Business Checking` and every field in the body. Then run it again with `"Type": "SPEND"` and check that the run returns `skipped: true, reason: "not-a-credit"` and sends no email.

## Customize

- **Shared inbox:** send to a team inbox or distribution list instead of one lead by changing `BILLING_LEAD_EMAIL`.
- **Team channel or task:** post the same details to a team channel, or create a reconciliation task in the accounting task list, with a step after the email.

## Notes

- Duplicates: the Xero trigger fires once per new transaction ID, which is what stops repeat alerts. The workflow keeps no record of past alerts, so a transaction that Xero reports again under the same ID is not alerted twice, but the code itself does no lookup.
- Xero's trigger fires when a transaction is created. One created as a draft and authorised later is skipped at creation and does not fire again.
- Email by Zapier sends from a zapiermail.com address and is limited to 10 emails an hour on paid plans (5 a day on Free). Heavy days can hit the limit. Switch to Gmail or Outlook if they do.
- `LineItems` may arrive as a list of objects or as text. The code accepts both and falls back to `(no description)`.
- Never commit a real email address in `workflow.ts`.
