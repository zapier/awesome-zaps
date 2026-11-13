# Create contractor bid emails from updated sheet rows

When a bid request row in a project sheet is updated, a draft bid email to the contractor is created for you to review, and the row is marked so it is not drafted twice.

**Apps:** Google Sheets, Gmail

**Based on:** [Create contractor bid emails from updated sheet rows](https://zapier.com/automations/business-owners/construction-operations/project-bid-management/create-contractor-bid-emails-from-updated-sheet-rows) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-contractor-bid-emails-from-updated-sheet-rows

The agent follows `SKILL.md`: it asks you for your bid request sheet, its columns and the billing notice, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-sheets`)
- `triggers/`: what starts it
