# Create payroll rows from extra hours form submissions

Each extra-hours form submission becomes a payroll row in your Google Sheets worksheet, and the payroll clerks get an email to review it before payroll runs.

**Apps:** Typeform, Google Sheets, Gmail

**Based on:** [Create payroll rows from extra hours form submissions](https://zapier.com/automations/human-resources-hr/payroll-compensation/payroll-processing/create-payroll-rows-from-extra-hours-form-submissions) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-payroll-rows-from-extra-hours-form-submissions

The agent follows `SKILL.md`: it asks you for your extra-hours form, the payroll sheet and the payroll clerk email, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-sheets`, `typeform`)
- `triggers/`: what starts it
