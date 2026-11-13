# Create creative asset records from task webhook entries

When a task posts its creative assets, each file becomes a Notion asset record with its format, style, theme and creator read from the filename, linked to the original request.

**Apps:** Webhooks by Zapier, Notion

**Based on:** [Create creative asset records from task webhook entries](https://zapier.com/automations/design/creative-operations/asset-management/create-creative-asset-records-from-task-webhook-entries) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-creative-asset-records-from-task-webhook-entries

The agent follows `SKILL.md`: it asks you for your two Notion databases and the host your asset links use, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`notion`)
- `triggers/`: what starts it
