# Create PO records from new purchase orders

When a purchase order PDF lands in your OneDrive folder, its company and PO number are read and logged as one row in your PO table, with a link back to the file.

**Apps:** OneDrive, PDF4me, ChatGPT (OpenAI), Zapier Tables

**Based on:** [Create PO records from new Purchase Order PD FS](https://zapier.com/automations/finance/procure-to-pay/purchase-order-management/create-po-records-from-new-purchase-order-pd-fs) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-po-records-from-new-purchase-order-pd-fs

The agent follows `SKILL.md`: it asks you for your PO folder, your PO table and its field keys, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`chatgpt`, `onedrive`, `pdf4me`, `zapier-tables`)
- `triggers/`: what starts it
