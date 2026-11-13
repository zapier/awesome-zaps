# Send contract request emails to assigned advisors today

When a contract request lands or changes in your tracking sheet, the assigned advisor gets an email with the details, so review starts right away.

**Apps:** Google Sheets, Microsoft Outlook

**Based on:** [Send contract request emails to assigned advisors today](https://zapier.com/automations/legal/contract-management/contract-review/send-contract-request-emails-to-assigned-advisors-today) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-contract-request-emails-to-assigned-advisors-today

The agent follows `SKILL.md`: it asks you which sheet is the contract request tracker, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-sheets`, `microsoft-outlook`)
- `triggers/`: what starts it
