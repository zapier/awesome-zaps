# Update legal task from address verification record intake

When a new address verification intake row lands in a Zapier Table, the matching ClickUp legal task is updated and the intake row is cleared from the queue.

**Apps:** Zapier Tables, ClickUp

**Based on:** [Update legal task from address verification record intake](https://zapier.com/automations/legal/legal-operations/legal-intake-management/update-legal-task-from-address-verification-record-intake) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/update-legal-task-from-address-verification-record-intake

The agent follows `SKILL.md`: it asks you for your intake table, your ClickUp workspace, which task fields get the result and whether processed rows are deleted, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`clickup`, `zapier-tables`)
- `triggers/`: what starts it
