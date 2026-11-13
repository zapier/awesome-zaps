# Send low stock email alerts to team leaders

When a branch's stock count in your inventory sheet drops below its minimum, the branch's team leaders get an email with the product and the count.

**Apps:** Google Sheets, Gmail

**Based on:** [Send low stock email alerts to team leaders](https://zapier.com/automations/business-owners/retail-operations/inventory-replenishment/send-low-stock-email-alerts-to-team-leaders) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-low-stock-email-alerts-to-team-leaders

The agent follows `SKILL.md`: it asks you for the stock spreadsheet, each branch's identifier, its team leaders' email addresses and its minimum stock count, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code, including the branch list
- `config.ts`: the column letters it reads
- `connections/`: the accounts it uses (`gmail`, `google-sheets`)
- `triggers/`: what starts it, including the spreadsheet
