# Create monthly release notes task and launch checklist

On the first of each month, a release notes task is created in Asana from your template, filed in your recurring emails section, and given a subtask to set the newsletter send date.

**Apps:** Schedule by Zapier, Asana

**Based on:** [Create monthly release notes task and launch checklist](https://zapier.com/automations/product/digital-product-operations/release-notes-management/create-monthly-release-notes-task-and-launch-checklist) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-monthly-release-notes-task-and-launch-checklist

The agent follows `SKILL.md`: it asks you for your Asana workspace, project, task template, recurring emails section and send-date owner, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`asana`)
- `triggers/`: what starts it
