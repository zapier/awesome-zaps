# Create hourly finance report records in your reporting table

Every hour, the latest rows from your Salesforce report are written into your reporting table, so finance always sees current figures without copying them by hand.

**Apps:** Schedule by Zapier, Salesforce, Zapier Tables

**Based on:** [Create hourly finance report records in your reporting table](https://zapier.com/automations/finance/financial-reporting/management-reporting/create-hourly-finance-report-records-in-your-reporting-table) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-hourly-finance-report-records-in-your-reporting-table

The agent follows `SKILL.md`: it asks you for the Salesforce report that feeds finance, the Zapier Table that receives its rows, and the order of the report's columns, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`salesforce`, `zapier-tables`)
- `triggers/`: what starts it
