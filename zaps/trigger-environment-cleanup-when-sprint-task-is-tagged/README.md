# Trigger environment cleanup when sprint task is tagged

When a teardown tag is added to a sprint task in Asana, your removal API is sent the task's ID and title, so the environment for that task is reclaimed without manual steps.

**Apps:** Asana, Webhooks by Zapier

**Based on:** [Trigger environment cleanup when sprint task is tagged](https://zapier.com/automations/engineering/dev-ops/environment-management/trigger-environment-cleanup-when-sprint-task-is-tagged) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/trigger-environment-cleanup-when-sprint-task-is-tagged

The agent follows `SKILL.md`: it asks you for the Asana workspace, sprint project and teardown tag, and your removal API's URL, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`asana`)
- `triggers/`: what starts it
