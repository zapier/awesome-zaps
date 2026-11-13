# Create dispatch orders from zero-paid invoices

When a Xero invoice is paid at zero or near-zero, the matching dispatch order is created in your warehouse system automatically, and IT is emailed if that fails.

**Apps:** Xero, CartonCloud, Gmail

**Based on:** [Create dispatch orders from zero-paid invoices for ops](https://zapier.com/automations/sales/sales-operations/sales-order-processing/create-dispatch-orders-from-zero-paid-invoices-for-ops) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-dispatch-orders-from-zero-paid-invoices-for-ops

The agent follows `SKILL.md`: it asks you for the Xero organization, the CartonCloud tenant and customer, and the address for IT notices, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`cartoncloud`, `gmail`, `xero`)
- `triggers/`: what starts it
