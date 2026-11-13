# Log completed time entries into central billing sheet

Each completed time entry becomes one row in your central billing sheet the same day, with the date, hours and project filled in, and duplicates or internal time left out.

**Apps:** Webhooks by Zapier, Google Sheets

**Based on:** [Log completed time entries into central billing sheet](https://zapier.com/automations/business-owners/professional-services-consulting/time-billing-management/log-completed-time-entries-into-central-billing-sheet) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/log-completed-time-entries-into-central-billing-sheet

The agent follows `SKILL.md`: it asks you for your billing spreadsheet and its columns, the internal projects and non-billable categories, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`google-sheets`)
- `triggers/`: what starts it
