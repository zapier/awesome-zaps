# Create due diligence review list with templated tasks

When a due-diligence review request arrives, a dated ClickUp list is created from your template, its tasks get the review dates, custom fields and requestor, so the deal team can start right away.

**Apps:** Webhooks by Zapier, ClickUp

**Based on:** [Create due diligence review list with templated tasks](https://zapier.com/automations/executives/corporate-development/due-diligence-management/create-due-diligence-review-list-with-templated-tasks) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-due-diligence-review-list-with-templated-tasks

The agent follows `SKILL.md`: it asks you for your ClickUp workspace, space, list template and the custom fields for each detail, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`clickup`)
- `triggers/`: what starts it
