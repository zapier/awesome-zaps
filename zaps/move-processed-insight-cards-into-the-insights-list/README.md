# Move processed insight cards into the insights list

When a batch of processed insights comes in, each matching Trello card is moved into your insights list, one at a time, so triage starts from one place.

**Apps:** Webhooks by Zapier, Trello

**Based on:** [Move processed insight cards into the insights list](https://zapier.com/automations/product/user-research-management/insight-distribution/move-processed-insight-cards-into-the-insights-list) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/move-processed-insight-cards-into-the-insights-list

The agent follows `SKILL.md`: it asks you for the Trello board that holds the insight cards and its insights list, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`trello`)
- `triggers/`: what starts it
