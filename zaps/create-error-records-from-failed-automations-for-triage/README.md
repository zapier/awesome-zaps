# Create error records from failed automations for triage

When one of your Zaps fails, a record is created in your Airtable triage table, or the existing record for that failure is updated, so someone can pick it up.

**Apps:** Zapier Manager, Airtable

**Based on:** [Create error records from failed automations for triage](https://zapier.com/automations/it/incident-response/incident-triage/create-error-records-from-failed-automations-for-triage) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-error-records-from-failed-automations-for-triage

The agent follows `SKILL.md`: it asks you for the Airtable base and table that hold the triage records and their field names, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`airtable`, `zapier-manager`)
- `triggers/`: what starts it
