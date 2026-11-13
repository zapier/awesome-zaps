# Create formatted order rows from incoming order emails

Parses each order confirmation email, pulls out the order, customer, address and payment fields, and appends one cleaned row per paid order to your master orders sheet. Duplicate order references are skipped.

**Apps:** Gmail, Google Sheets

**Based on:** [Create formatted order rows from incoming order emails](https://zapier.com/automations/data-analytics/data-operations/data-quality-management/create-formatted-order-rows-from-incoming-order-emails) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-formatted-order-rows-from-incoming-order-emails

The agent follows `SKILL.md`: it asks you for the sheet that holds your orders and the emails to read, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-sheets`)
- `triggers/`: what starts it
