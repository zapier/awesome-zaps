# Create payment intents from new billing records

When a billing record lands in your Zapier table, a matching Stripe payment intent is created and its ID and status are written back to the record for reconciliation.

**Apps:** Zapier Tables, Stripe

**Based on:** [Create payment intents from new billing records daily](https://zapier.com/automations/finance/payment-operations/payment-processing-management/create-payment-intents-from-new-billing-records-daily) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-payment-intents-from-new-billing-records-daily

The agent follows `SKILL.md`: it asks you which table holds the billing records, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`stripe`, `zapier-tables`)
- `triggers/`: what starts it
