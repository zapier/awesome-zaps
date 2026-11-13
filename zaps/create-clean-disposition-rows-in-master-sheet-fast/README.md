# Create clean disposition rows in master sheet fast

When a campaign sheet's disposition is updated, a cleaned row with one standard label goes into your master sheet, and anything unclear is marked for review.

**Apps:** Google Sheets, AI by Zapier

**Based on:** [Create clean disposition rows in master sheet fast](https://zapier.com/automations/data-analytics/data-automation/spreadsheet-data-processing/create-clean-disposition-rows-in-master-sheet-fast) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-clean-disposition-rows-in-master-sheet-fast

The agent follows `SKILL.md`: it asks you for the campaign and master spreadsheets and the allowed dispositions, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`google-sheets`)
- `triggers/`: what starts it
