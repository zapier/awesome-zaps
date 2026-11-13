# Create claims database entry from updated sheet rows

When a claim row in your sheet is updated, a matching claim record is added to your Zapier Table, with a link back to the row, so triage works from one clean list.

**Apps:** Google Sheets, Zapier Tables

**Based on:** [Create claims database entry from updated sheet rows](https://zapier.com/automations/business-owners/insurance-management/claims-management/create-claims-database-entry-from-updated-sheet-rows) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-claims-database-entry-from-updated-sheet-rows

The agent follows `SKILL.md`: it asks you for the claims sheet, the Zapier Table that receives the claims, and which columns hold each claim field, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`google-sheets`)
- `triggers/`: what starts it
