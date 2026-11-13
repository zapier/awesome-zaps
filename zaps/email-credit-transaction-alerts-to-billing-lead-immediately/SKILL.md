---
name: email-credit-transaction-alerts-to-billing-lead-immediately
description: Build a Zap on Zapier that watches Xero for new posted credit (money received) bank transactions and immediately emails the billing lead a detailed alert with payee, amount, bank account, date, reference and description. Use when a finance or billing team wants to know the moment money lands so they can reconcile and invoice without delay.
license: MIT
metadata:
  author: zapier
  summary: "When money is received into a Xero bank account, your billing lead gets an email right away with the payee, amount, account, date and reference."
  apps: "Xero, Email by Zapier"
  category: "Finance"
  job: "Banking operations"
  source: "https://zapier.com/automations/finance/banking-operations/transaction-monitoring/email-credit-transaction-alerts-to-billing-lead-immediately"
---

# Email credit transaction alerts to billing lead

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/email-credit-transaction-alerts-to-billing-lead-immediately. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** Xero, New Bank Transaction (`xero`, `bank_transaction`), fires for each new bank transaction in the chosen organization.
2. **Filter (code):** continues only for credits (Xero types starting with `RECEIVE`: `RECEIVE`, `RECEIVE-OVERPAYMENT`, `RECEIVE-PREPAYMENT`, `RECEIVE-TRANSFER`) whose status is posted (`AUTHORISED`) and whose `Total` is greater than `MIN_CREDIT_AMOUNT`. Anything else returns `skipped` with a reason and sends nothing.
3. **Email by Zapier** sends one email to the billing lead. The subject names the amount and bank account (`Credit received: 1250.00 USD into Business Checking`). The body lists payee, amount, bank account and code, date, reference, line-item descriptions, type, reconciled flag and transaction ID.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                      | What goes there                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_BILLING_LEAD_EMAIL` | The billing lead's email address, or a shared inbox, that gets each credit alert. Up to 5 comma-separated addresses |

Also ask:

- Which Xero organization should be watched? The trigger needs one. If they have no Xero connection, have them connect one first.

Review the defaults with them:

- `MIN_CREDIT_AMOUNT` in `workflow.ts`: alert only when the total is greater than this. It is `0` by default; raise it to skip small credits.
- `POSTED_STATUSES` in `workflow.ts`: the Xero statuses treated as posted. It is `["AUTHORISED"]` by default.
- `FROM_NAME` in `config.ts`: the sender's display name. It is `"Xero credit alerts"` by default.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `xero` (the trigger's account only) to the user's Xero connection for the organization they chose. The workflow itself names no connection. Email by Zapier needs none.
2. **Source:** publish `workflow.ts` and `config.ts`, with `REPLACE_BILLING_LEAD_EMAIL` replaced by the user's answer. `triggers/bank-transaction.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. Set the trigger's `organization` to the Xero organization the user chose, resolved from that field's choices (`get_trigger_field_choices`, field `organization`) with the user's Xero connection. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections, and sample the trigger with the chosen organization (the `bank_transaction` read action), before the first test run. Check that `Type`, `Status`, `Total`, `Contact.Name`, `BankAccount.Name` and `LineItems` arrive as the code expects, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with the billing lead's address set to an inbox the user controls. Use this sample input:

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

Check that one email arrives with the subject `Credit received: 1250.00 USD into Business Checking` and every field in the body. Then run it again with `"Type": "SPEND"` and check that the run returns `skipped: true, reason: "not-a-credit"` and sends no email. If run-status tools aren't available, check the result in the inbox directly.

Then publish, confirm the trigger is active, and ask the user to delete the test email. The user deletes test data, not the agent.

## Notes

- Alerts are not repeated for one transaction: the Xero trigger fires once per new transaction ID. The workflow keeps no record of past alerts and does no lookup.
- Xero's trigger fires when a transaction is created. One created as a draft and authorised later is skipped at creation and does not fire again.
- Email by Zapier sends from a zapiermail.com address and is limited to 10 emails an hour on paid plans (5 a day on Free). Switch to Gmail or Outlook if heavy days hit the limit.
- `LineItems` may arrive as a list of objects or as text. The code accepts both and falls back to `(no description)`.
- To change who receives alerts, change `REPLACE_BILLING_LEAD_EMAIL`. To post to a team channel or create a reconciliation task too, add a step after the email.
- Never commit a real email address to the repo.
