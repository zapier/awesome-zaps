# Update experiment record status from task changes

When a ClickUp task changes status, its matching experiment record in your Airtable table is updated to the same status, so reports and handoffs show current delivery progress.

**Apps:** ClickUp, Airtable

**Based on:** [Update experiment record status from task changes](https://zapier.com/automations/product/product-experimentation/feature-experiment-tracking/update-experiment-record-status-from-task-changes) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-experiment-record-status-from-task-changes

The agent follows `SKILL.md`: it asks you for your ClickUp workspace and your Airtable base and experiments table, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`airtable`, `clickup`)
- `triggers/`: what starts it
