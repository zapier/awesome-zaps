# Create delay log for deals entering document delay stage

When a Pipedrive deal moves into the document delay stage, a row is added to a Zapier Table with the deal, the time and an open triage flag, so nothing stuck on paperwork goes unnoticed.

**Apps:** Pipedrive, Zapier Tables

**Based on:** [Create delay log for deals entering document delay stage](https://zapier.com/automations/sales/pipeline-management/deal-tracking/create-delay-log-for-deals-entering-document-delay-stage) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-delay-log-for-deals-entering-document-delay-stage

The agent follows `SKILL.md`: it asks you for the document-delay stage and the delay log table, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`pipedrive`, `zapier-tables`)
- `triggers/`: what starts it
