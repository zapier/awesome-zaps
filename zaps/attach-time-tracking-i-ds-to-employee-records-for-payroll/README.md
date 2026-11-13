# Attach time tracking IDs to employee records for payroll

When time-tracking entries arrive, each one is attached to the matching employee record, so payroll can reconcile timesheets without manual lookups.

**Apps:** Airtable, Webhooks by Zapier

**Based on:** [Attach time tracking IDs to employee records for payroll](https://zapier.com/automations/human-resources-hr/workforce-operations/time-tracking/attach-time-tracking-i-ds-to-employee-records-for-payroll) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/attach-time-tracking-i-ds-to-employee-records-for-payroll

The agent follows `SKILL.md`: it asks you for your Airtable base, employee table, and the columns that hold email, full name and the time-tracking link, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`airtable`)
- `triggers/`: what starts it
