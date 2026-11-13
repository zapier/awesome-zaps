# Send incoming receipts to tax provider and archive

Each new receipt in your intake folder is emailed to your tax provider, then filed away in a processed folder a day later.

**Apps:** Google Drive, Gmail

**Based on:** [Send incoming receipts to tax provider and archive](https://zapier.com/automations/finance/tax-management/tax-document-collection/send-incoming-receipts-to-tax-provider-and-archive) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-incoming-receipts-to-tax-provider-and-archive

The agent follows `SKILL.md`: it asks you for your intake and processed Drive folders and your tax provider's upload address, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent builds, asks and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-drive`)
- `triggers/`: what starts it
