# Update asset records from inventory changes

When a device's record in your inventory changes, its matching asset record in your central Notion database is found, or created if missing, and updated with the latest details.

**Apps:** Notion

**Based on:** [Update asset records from inventory changes for IT teams](https://zapier.com/automations/it/it-operations/it-asset-management/update-asset-records-from-inventory-changes-for-it-teams) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-asset-records-from-inventory-changes-for-it-teams

The agent follows `SKILL.md`: it asks you for your inventory and asset Notion databases and the property names they use, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`notion`)
- `triggers/`: what starts it
