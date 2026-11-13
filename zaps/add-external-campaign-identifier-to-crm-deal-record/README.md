# Add external campaign identifier to CRM deal record

When a marketing system posts a campaign ID for a deal, that ID is saved on the deal in Pipedrive, so sales can see where the deal came from.

**Apps:** Webhooks by Zapier, Pipedrive

**Based on:** [Add external campaign identifier to CRM deal record](https://zapier.com/automations/sales/crm-management/crm-data-enrichment/add-external-campaign-identifier-to-crm-deal-record) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/add-external-campaign-identifier-to-crm-deal-record

The agent follows `SKILL.md`: it asks you which Pipedrive deal field holds the campaign ID, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`pipedrive`)
- `triggers/`: what starts it
