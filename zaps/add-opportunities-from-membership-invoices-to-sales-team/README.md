# Add opportunities from membership invoices to sales team

When a membership invoice is paid in Stripe, a matching opportunity appears in Salesforce with the amount, close date and plan, linked to the customer, so the sales team sees the revenue.

**Apps:** Stripe, Salesforce

**Based on:** [Add opportunities from membership invoices to sales team](https://zapier.com/automations/sales/pipeline-management/deal-tracking/add-opportunities-from-membership-invoices-to-sales-team) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/add-opportunities-from-membership-invoices-to-sales-team

The agent follows `SKILL.md`: it asks you which Stripe plans count as membership, and which Salesforce record type, stage and fields to use, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`salesforce`, `stripe`)
- `triggers/`: what starts it
