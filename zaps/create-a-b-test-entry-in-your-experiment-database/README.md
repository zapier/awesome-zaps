# Create an A/B test entry in your experiment database

When a task reaches your A/B testing section in Asana, a matching entry is created in your Notion experiment database, so every test has a record without manual copying.

**Apps:** Asana, Notion

**Based on:** [Create A/B test entry in your experiment database](https://zapier.com/automations/product/product-experimentation/feature-experiment-tracking/create-a-b-test-entry-in-your-experiment-database) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-a-b-test-entry-in-your-experiment-database

The agent follows `SKILL.md`: it asks you for your A/B testing section in Asana and your experiment database in Notion, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`asana`, `notion`)
- `triggers/`: what starts it
