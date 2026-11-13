# Create sales orders and line items from purchases

When a Shopify order is paid, its sales order and each item are created in your ERP or CRM, with a discount line when there is one, so fulfillment works from the same data.

**Apps:** Shopify, Webhooks by Zapier

**Based on:** [Create sales orders and line items from purchases](https://zapier.com/automations/sales/sales-operations/sales-order-processing/create-sales-orders-and-line-items-from-purchases) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-sales-orders-and-line-items-from-purchases

The agent follows `SKILL.md`: it asks you for the ERP or CRM endpoint URLs for sales orders and sales-order lines, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`shopify`)
- `triggers/`: what starts it
