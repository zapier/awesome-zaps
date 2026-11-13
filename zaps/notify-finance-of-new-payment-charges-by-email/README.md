# Notify finance of new payment charges by email

Every new Stripe charge sends your finance team a short email with the amount, status and a link to the charge, so issues get triaged the same day.

**Apps:** Stripe, Email by Zapier

**Based on:** [Notify finance of new payment charges by email](https://zapier.com/automations/finance/payment-operations/payment-reconciliation/notify-finance-of-new-payment-charges-by-email) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/notify-finance-of-new-payment-charges-by-email

The agent follows `SKILL.md`: it asks you for the finance and billing addresses that get the charge emails, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`stripe`)
- `triggers/`: what starts it
