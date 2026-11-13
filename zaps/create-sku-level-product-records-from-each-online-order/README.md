# Create SKU-level product records from each online order

Every paid Shopify order is split into one product record per line item, so merchandising and inventory teams can see what sold, by SKU, as orders come in.

**Apps:** Shopify, Zapier Tables

**Based on:** [Create SKU-level product records from each online order](https://zapier.com/automations/product/product-analytics/product-performance-metrics/create-sku-level-product-records-from-each-online-order) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-sku-level-product-records-from-each-online-order

The agent follows `SKILL.md`: it asks you for the product performance table, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`shopify`, `zapier-tables`)
- `triggers/`: what starts it
