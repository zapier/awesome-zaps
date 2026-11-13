# Email credit transaction alerts to billing lead

When money is received into a Xero bank account, your billing lead gets an email right away with the payee, amount, account, date and reference.

**Apps:** Xero, Email by Zapier

**Based on:** [Email credit transaction alerts to billing lead immediately](https://zapier.com/automations/finance/banking-operations/transaction-monitoring/email-credit-transaction-alerts-to-billing-lead-immediately) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/email-credit-transaction-alerts-to-billing-lead-immediately

The agent follows `SKILL.md`: it asks you for the Xero organization to watch and the billing lead's email address, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`xero`)
- `triggers/`: what starts it
