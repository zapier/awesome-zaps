# Create customer reference records in shared project list

When a new customer is added in QuickBooks Online, their reference record in a shared SharePoint list is created or refreshed, so every team works from the same customer details.

**Apps:** QuickBooks Online, Microsoft SharePoint

**Based on:** [Create customer reference records in shared project list](https://zapier.com/automations/sales/sales-enablement/customer-reference-management/create-customer-reference-records-in-shared-project-list) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-customer-reference-records-in-shared-project-list

The agent follows `SKILL.md`: it asks you which SharePoint site and list hold the shared customer references, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`quickbooks`, `sharepoint`)
- `triggers/`: what starts it
