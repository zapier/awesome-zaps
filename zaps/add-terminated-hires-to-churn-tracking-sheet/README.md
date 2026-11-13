# Add terminated hires to churn tracking sheet

When an employment is terminated in Personio, the leaver's name, dates, department and weekly hours are added to your central churn sheet, so payroll and recruiting work from the same list.

**Apps:** Personio, Google Sheets

**Based on:** [Add terminated hires to central churn tracking sheet](https://zapier.com/automations/human-resources-hr/talent-pipeline-management/employee-offboarding/add-terminated-hires-to-central-churn-tracking-sheet) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/add-terminated-hires-to-churn-tracking-sheet

The agent follows `SKILL.md`: it asks you for your churn tracker sheet, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-sheets`, `personio`)
- `triggers/`: what starts it
