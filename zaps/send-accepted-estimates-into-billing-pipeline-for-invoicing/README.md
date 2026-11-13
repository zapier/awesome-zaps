# Send accepted estimates into billing pipeline for invoicing

When a QuickBooks Online estimate is accepted, its details and line items are sent to your billing system so the invoice can be started without re-typing.

**Apps:** QuickBooks Online, Webhooks by Zapier

**Based on:** [Send accepted estimates into billing pipeline for invoicing](https://zapier.com/automations/sales/proposal-management/quote-management/send-accepted-estimates-into-billing-pipeline-for-invoicing) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-accepted-estimates-into-billing-pipeline-for-invoicing

The agent follows `SKILL.md`: it asks you for your billing system's webhook URL and the QuickBooks Online company that holds the estimates, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`quickbooks`)
- `triggers/`: what starts it
