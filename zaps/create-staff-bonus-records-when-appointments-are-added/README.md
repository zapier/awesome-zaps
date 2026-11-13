# Create staff bonus records when appointments are added

When a new appointment is added in Salesforce, a bonus transaction for the staff member is logged automatically, so payroll is ready to process.

**Apps:** Salesforce

**Based on:** [Create staff bonus records when appointments are added](https://zapier.com/automations/human-resources-hr/payroll-compensation/payroll-processing/create-staff-bonus-records-when-appointments-are-added) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-staff-bonus-records-when-appointments-are-added

The agent follows `SKILL.md`: it asks you which Salesforce objects and fields hold appointments, staff and bonus transactions, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`salesforce`)
- `triggers/`: what starts it
