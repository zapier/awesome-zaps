# Add new hire rows to onboarding spreadsheet

When a candidate is hired in Ashby, a row with their start date, title, contact email and hiring manager lands in your onboarding spreadsheet, so People Ops, payroll and facilities all start from the same details.

**Apps:** Ashby, Google Sheets

**Based on:** [Add new hire rows to onboarding spreadsheet](https://zapier.com/automations/human-resources-hr/hr-operations/new-hire-documentation/add-new-hire-rows-to-onboarding-spreadsheet) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/add-new-hire-rows-to-onboarding-spreadsheet

The agent follows `SKILL.md`: it asks you for your onboarding sheet, its columns and your Ashby account, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`ashby`, `google-sheets`)
- `triggers/`: what starts it
