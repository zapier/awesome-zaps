# Create invoices and expenses from new table rows

Each new row in a Zapier Tables table becomes a QuickBooks Online invoice or expense, and rows that already exist in QuickBooks are skipped.

**Apps:** Zapier Tables, QuickBooks Online

**Based on:** [Create invoices and expenses from new table rows](https://zapier.com/automations/finance/accounts-payable/invoice-processing-management/create-invoices-and-expenses-from-new-table-rows) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-invoices-and-expenses-from-new-table-rows

The agent follows `SKILL.md`: it asks you for the table that holds the rows and your QuickBooks customer, vendor and accounts, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`quickbooks`, `zapier-tables`)
- `triggers/`: what starts it
