# Update daily currency rates across your finance records

Every hour, the latest exchange rates are fetched and written to one Notion record, so everyone reads the same numbers.

**Apps:** Schedule by Zapier, Webhooks by Zapier, Notion

**Based on:** [Update daily currency rates across your finance records](https://zapier.com/automations/finance/treasury-management/foreign-exchange-management/update-daily-currency-rates-across-your-finance-records) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-daily-currency-rates-across-your-finance-records

The agent follows `SKILL.md`: it asks you which Notion page holds the rates, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`notion`)
- `triggers/`: what starts it
