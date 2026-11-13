# Assign expert requests to next specialist in rotation

When a new expert request arrives by email, it goes to the next specialist in your rotation. They get the reply, and the rotation moves on so requests are shared out in turn.

**Apps:** Gmail, Zapier Tables

**Based on:** [Assign expert requests to next specialist in rotation](https://zapier.com/automations/business-owners/task-management/task-assignment-routing/assign-expert-requests-to-next-specialist-in-rotation) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/assign-expert-requests-to-next-specialist-in-rotation

The agent follows `SKILL.md`: it asks you for your rotation table, fallback address and the Gmail search that finds requests, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`gmail`)
- `triggers/`: what starts it
