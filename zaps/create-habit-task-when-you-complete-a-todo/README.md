# Create habit task when you complete a todo

When you finish a to-do in Todoist, a matching habit task is created in your habit tracker and scored, so your streaks and points update on their own.

**Apps:** Todoist, Webhooks by Zapier

**Based on:** [Create habit task when you complete a todo](https://zapier.com/automations/personal-productivity/health-wellness-tracking/habit-tracking/create-habit-task-when-you-complete-a-todo) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-habit-task-when-you-complete-a-todo

The agent follows `SKILL.md`: it asks you for your habit tracker's create-task and score endpoints and its API token, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`todoist`)
- `triggers/`: what starts it
