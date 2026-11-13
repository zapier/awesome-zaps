# Create weekly job invoicing performance report for finance

Every week, the jobs closed in the last seven days are counted from your jobs table and logged as a dated item in your finance database in Notion.

**Apps:** Schedule by Zapier, Zapier Tables, Notion

**Based on:** [Create weekly job invoicing performance report for finance](https://zapier.com/automations/finance/financial-reporting/management-reporting/create-weekly-job-invoicing-performance-report-for-finance) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-weekly-job-invoicing-performance-report-for-finance

The agent follows `SKILL.md`: it asks you for the jobs table, its closed-date field and the Notion finance database, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`notion`, `zapier-tables`)
- `triggers/`: what starts it
